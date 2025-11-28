import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { request } from "@octokit/request";
import { OctokitResponse } from "@octokit/types";
import { saveToLocalStorage } from "@/utilities/service-worker-funcs/storage-utils";
import { getToast } from "@/utilities/toastMessages";
import {
  handleNetworkRequestRetry,
  handleRequestError,
  isFailureFetchNumPRs,
} from "@/utilities/errorHandlingUtilities";
import { FailureFetchNumPRs } from "@/models/utilities/ServiceWorkerFuncsModels";
import { RequestError } from "@octokit/request-error";

const unauthenticatedFetch = async (
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string
): Promise<OctokitResponse<any, number>> => {
  const redirectUrl = repo.redirectUrl;

  const response = await request(
    `GET ${redirectUrl ? redirectUrl : `/repos/${repoOwner}/${repoName}/pulls`}`,
    {
      owner: repoOwner,
      repo: repoName,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return response;
};

const authenticatedFetch = async (
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string,
  storedPATCode: string
): Promise<OctokitResponse<any, number>> => {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: `token ${storedPATCode}`,
    },
  });

  const redirectUrl = repo.redirectUrl;

  const response = await requestWithAuth(
    `GET ${redirectUrl ? redirectUrl : `/repos/${repoOwner}/${repoName}/pulls`}`
  );

  console.log("This is the response from authenticated fetch:", response);
  return response;
};

async function handleUnauthenticatedFetch(
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string
): Promise<OctokitResponse<any, number>> {
  // unauthenticated request
  try {
    try {
      const response = await unauthenticatedFetch(repo, repoOwner, repoName);
      return response;
    } catch (e) {
      // handling network request retries in first instance if that is the error

      const requestError = e as RequestError;
      if (requestError.status === 500) {
        const succesfulRetryResponse = await handleNetworkRequestRetry(
          repo,
          repoOwner,
          repoName,
          3
        );

        if (succesfulRetryResponse) {
          return succesfulRetryResponse;
        } else {
          throw new Error("Error during handling of network request retry");
        }
      } else {
        // not a network request error so throwing error on for handling other recognised error types
        throw e;
      }
    }
  } catch (error) {
    // handling other errors not related to network issuess
    const errorObj: FailureFetchNumPRs = {
      waitInterval: 0,
      toastMessages: [],
      type: "",
    };

    try {
      console.error(
        `error fetching number of PRs (unauthenticated request) for repo ${repoName}: ${error} `
      );

      const retrievedErrorObj = await handleRequestError(error as RequestError);
      if (!retrievedErrorObj) {
        throw error;
      }

      errorObj.toastMessages = retrievedErrorObj.toastMessages;
      errorObj.waitInterval = retrievedErrorObj.waitInterval;

      throw errorObj;
    } catch (e) {
      console.error(
        "Unable to succesfully parse error object thrown in handleUnauthenticatedFetch within handleRateLimitError func"
      );

      throw errorObj;
    }

    //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
  }
}

async function handleAuthenticatedFetch(
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string,
  storedPATCode: string
): Promise<OctokitResponse<any, number>> {
  // authenticated request
  try {
    try {
      const response = await authenticatedFetch(
        repo,
        repoOwner,
        repoName,
        storedPATCode
      );
      return response;
    } catch (e) {
      // handling network request retries in first instance if that is the error

      const requestError = e as RequestError;
      if (requestError.status === 500) {
        const succesfulRetryResponse = await handleNetworkRequestRetry(
          repo,
          repoOwner,
          repoName,
          3,
          storedPATCode
        );

        if (succesfulRetryResponse) {
          // creating polling alarm again as retry process succesful
          console.log("succesful github fetch made");

          return succesfulRetryResponse;
        } else {
          console.log("falsy value for succesfulRetryResponse var");
          throw new Error("Error during handling of network request retry");
        }
      } else {
        // not a network request error so throwing error on for handling other recognised error types
        throw e;
      }
    }
  } catch (error) {
    const errorObj: FailureFetchNumPRs = {
      waitInterval: 0,
      toastMessages: [],
      type: "",
    };

    try {
      console.error(
        `error fetching number of PRs (authenticated request) for repo ${repoName}: ${error} `
      );

      const retrievedErrorObj = await handleRequestError(error as RequestError);
      if (!retrievedErrorObj) {
        console.log("there is no retrievedErrorObj");
        throw error;
      }

      console.log("this is the retrievedErrorObj:", retrievedErrorObj);

      errorObj.type = retrievedErrorObj.type;
      errorObj.toastMessages = retrievedErrorObj.toastMessages;
      errorObj.waitInterval = retrievedErrorObj.waitInterval;

      throw errorObj;
    } catch (e) {
      console.error("error thrown in handleAuthenticatedFetch:", e);

      if (!isFailureFetchNumPRs(e)) {
        throw errorObj;
      }
      throw e;
    }

    //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
  }
}

async function retrieveFetchResults(
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string,
  storedPATCode: string | null
): Promise<OctokitResponse<any, number>> {
  try {
    if (!storedPATCode) {
      // unauthenticated request
      const results = await handleUnauthenticatedFetch(
        repo,
        repoOwner,
        repoName
      );
      return results;
    } else {
      // authenticated request
      const results = await handleAuthenticatedFetch(
        repo,
        repoOwner,
        repoName,
        storedPATCode
      );
      return results;
    }
  } catch (e) {
    console.log("error in retrieveFetchResults:", e);
    throw e;
  }
}

async function handleRetrieval(
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string,
  storedPATCode: string | null
): Promise<OctokitResponse<any, number>> {
  try {
    const results = await retrieveFetchResults(
      repo,
      repoOwner,
      repoName,
      storedPATCode
    );
    return results;
  } catch (e) {
    console.error("error in handleRetrieval:", e);
    throw e;
  }
}

async function handleRedirectLogic({
  repo,
  repoName,
  activeNumPRs,
  responseStatus,
  responseUrl,
}: {
  repo: ActiveNumPRs;
  repoName: string;
  activeNumPRs: ActiveNumPRs[];
  responseStatus: number;
  responseUrl: string;
}): Promise<ActiveNumPRs | void> {
  function checkForRedirects({
    status,
    url,
  }: {
    status: number;
    url: string;
  }): { type: string; url: string } {
    console.log("status:", status);
    console.log("url:", url);

    let redirectionType: string = "na";

    // Handling redirection status codes - see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#follow-redirects

    if (status === 302 || status === 307) {
      // temporary redirection
      redirectionType = "temporary";
    } else if (status === 301) {
      // permanent redirection
      redirectionType = "permanent";
    }

    return {
      type: redirectionType,
      url: url,
    };
  }

  const status = responseStatus;
  const url = responseUrl;
  const redirects = checkForRedirects({ status, url });

  if (redirects.type === "temporary") {
    console.log("repeating fetchNumPRs with temporary redirect url");
    const temporaryChangedRepo = { ...repo, redirectUrl: redirects.url };

    return temporaryChangedRepo;
  } else if (redirects.type === "permanent") {
    console.log("repeating fetchNumPRs with permanent redirect url");

    const updatedActiveNumPRs = activeNumPRs;
    for (let i = 0; i < updatedActiveNumPRs.length; i++) {
      if (updatedActiveNumPRs[i].name === repoName) {
        updatedActiveNumPRs[i].redirectUrl = redirects.url;
        await saveToLocalStorage("activeNumPRs", updatedActiveNumPRs);

        return updatedActiveNumPRs[i];
      }
    }
  } else {
    console.log(`no redirects detected in pr fetch for repo ${repoName}`);
    return;
  }
}

function checkUpcomingTokenExpiry(
  responseHeaders: any,
  currentFetch: number,
  activeNumPRs: ActiveNumPRs[]
): string | undefined {
  function isWithinFourDays(inputDate: Date): Boolean {
    console.log("this is the typeof inputDate", typeof inputDate);

    const now = new Date();
    const fourDaysInMilliseconds = 4 * 24 * 60 * 60 * 1000; // 345,600,000 milliseconds

    // Calculate the absolute difference in milliseconds
    const timeDifference = Math.abs(now.getTime() - inputDate.getTime());

    // Compare the difference to the 4-day threshold
    return timeDifference <= fourDaysInMilliseconds;
  }

  function isTokenExpiry(headers: any): string | undefined {
    try {
      const expirationDate = headers["github-authentication-token-expiration"];

      if (expirationDate) {
        console.log(`Token expires on: ${expirationDate}`);
        return expirationDate as string;
      }
    } catch (e) {
      console.log("Token expiration header not found.");
      return;
    }
  }

  // check if current personal access token expiry is coming soon (if response header returned for the request) to flag to user
  const lastFetch = currentFetch === activeNumPRs.length - 1;

  if (lastFetch) {
    console.log("on lastfetch so checking following headers", responseHeaders);
    const tokenExpiry = isTokenExpiry(responseHeaders);

    // checking token expiry header is present in response
    if (tokenExpiry) {
      console.log(`Token expiry date: ${tokenExpiry}`);

      const isoString = tokenExpiry.replace(" ", "T").replace(" UTC", "Z");

      //console.log("tokenExpiry before conversion", isoString);
      const expiryDateObj = new Date(isoString);
      //console.log("expiryDateObj", convertedTokenExpiry);

      // check if token is set to expire within four days
      const nearExpiry = isWithinFourDays(expiryDateObj);

      if (nearExpiry) {
        const toastMessage = getToast(
          "info",
          "upcomingTokenExpiry",
          undefined,
          expiryDateObj.toString()
        );
        return toastMessage;
      }

      console.log("token expiry not within 4 days, no toast triggered");
      return;
    }

    return;
  }

  return;
}

export {
  retrieveFetchResults,
  handleRetrieval,
  handleRedirectLogic,
  checkUpcomingTokenExpiry,
  authenticatedFetch,
  unauthenticatedFetch,
};
