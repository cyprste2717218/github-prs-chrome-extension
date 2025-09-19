import { RequestError } from "@octokit/request-error";
import { request } from "@octokit/request";
import {
  saveToSessionStorage,
  saveToLocalStorage,
  loadFromLocalStorage,
  loadFromSessionStorage,
} from "./storage-utils";

type SubmitPRDetailsProps = {
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
  redirectUrl?: string;
};

function initializeExtension() {
  // set intitial state variable default values on first install, chrome version update or extension update for setting current step react state]

  chrome.storage.local.set({
    step: 1,
    username: "",
    repoDetails: null,
    activeNumPRs: [],
  });
}

async function updatePRDetails({
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps): Promise<ActiveNumPRs[]> {
  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);
  const storedPATCode = await loadFromLocalStorage("patCode");
  let updatedNumPRs: ActiveNumPRs[] = [];

  type SucessFetchNumPRs = {
    name: string;
    numActivePRs: number;
  };

  type FailureFetchNumPRs = {
    waitInterval: number;
    messages: string[];
  };

  type FetchNumPRs = SucessFetchNumPRs | FailureFetchNumPRs;

  function isSuccessFetchNumPRs(obj: FetchNumPRs): obj is SucessFetchNumPRs {
    return (
      typeof obj === "object" &&
      "name" in obj &&
      "numActivePRs" in obj &&
      typeof obj.name === "string" &&
      typeof obj.numActivePRs === "number"
    );
  }

  function isFailureFetchNumPRs(obj: FetchNumPRs): obj is FailureFetchNumPRs {
    return (
      typeof obj === "object" &&
      "waitInterval" in obj &&
      "messages" in obj &&
      typeof obj.waitInterval === "number" &&
      Array.isArray(obj.messages) &&
      obj.messages.every((item: any) => typeof item === "string")
    );
  }

  // Fetch current number of PRs for given repo, using authenticated or deaunthenticated approach
  const fetchNumPRs = async (
    repo: ActiveNumPRs
  ): Promise<SucessFetchNumPRs | FailureFetchNumPRs> => {
    function handleRedirectLogic({
      response,
    }: {
      response: { status: number; url: string };
    }): void {
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

      const status = response.status;
      const url = response.url;
      const redirects = checkForRedirects({ status, url });

      if (redirects.type === "temporary") {
        console.log("repeating fetchNumPRs with temporary redirect url");
        const temporaryChangedRepo = { ...repo, redirectUrl: redirects.url };
        fetchNumPRs(temporaryChangedRepo);

        return;
      } else if (redirects.type === "permanent") {
        console.log("repeating fetchNumPRs with permanent redirect url");

        const updatedActiveNumPRs = activeNumPRs;
        for (let i = 0; i < updatedActiveNumPRs.length; i++) {
          if (updatedActiveNumPRs[i].name === repoName) {
            updatedActiveNumPRs[i].redirectUrl = redirects.url;
          }
        }
        saveToLocalStorage("activeNumPRs", updatedActiveNumPRs);
        fetchNumPRs(repo);

        return;
      }
    }

    function handleRateLimitError(error: RequestError): FailureFetchNumPRs {
      // check if it was a primary or secondary rate limit error which was met
      let waitInterval: number = 0;
      const messages: string[] = [];

      if (error.response && (error.status === 403 || error.status === 429)) {
        // checking if conditions met for primary rate limit error
        if (error.response.headers["x-ratelimit-remaining"] === "0") {
          // if x-ratelimit-remaining header present, then the x-ratelimit-reset header for when safe to make another separate request must be also present
          const resetTimeEpochSeconds = Number(
            error.response.headers["x-ratelimit-reset"]
          );

          const currentTimeEpochSeconds = Math.floor(Date.now() / 1000);
          const secondsToWait = resetTimeEpochSeconds - currentTimeEpochSeconds;

          waitInterval = secondsToWait;
          messages.push(
            `Primary rate limit error, waiting ${waitInterval} seconds before making another request`
          );
        }

        // check if secondary rate limit error has occurred so timer can possibly be set for that duration (dependent on whether duration stated by 'retry-after' or 'x-ratelimit-reset' header is longer)
        if (error.response.headers["retry-after"] !== undefined) {
          const retryAfterHeaderVal: number = Number(
            error.response.headers["retry-after"]
          );
          if (retryAfterHeaderVal > waitInterval) {
            waitInterval = retryAfterHeaderVal;
          }

          messages.push(
            `Secondary rate limit error, waiting ${waitInterval} seconds before making another request`
          );
        }
      }

      return {
        waitInterval: waitInterval,
        messages: messages,
      };
    }

    const repoName = repo.name;
    const owner = repoOwner;
    const currentNumPRs = repo.numActivePRs;
    const redirectUrl = repo.redirectUrl;
    let results: any;

    // To-do: Switch out request url for authenticated and unauthenticated requests to use the one from the redirectUrl variable if present
    if (!storedPATCode) {
      // unauthenticated request

      await request(`GET /repos/${owner}/${repoName}/pulls`, {
        owner: owner,
        repo: repoName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        url: redirectUrl,
      })
        .then((response) => {
          handleRedirectLogic({ response });

          results = response.data;
        })
        .catch((error) => {
          const errorDetails = handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );

          return errorDetails;

          //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
        });
    } else {
      // authenticated request

      const requestWithAuth = request.defaults({
        headers: {
          authorization: `token ${storedPATCode}`,
        },
      });

      await requestWithAuth(`GET /repos/${owner}/${repoName}/pulls`)
        .then((response) => {
          handleRedirectLogic({ response });

          results = response.data;
        })
        .catch((error) => {
          const errorDetails = handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );

          return errorDetails;
        });
    }

    // update number of PRs for repo if number changed

    // setting a default value in case fetch request doesn't return a number (on first load of displayed tracked repos page)
    let updatedNumPRs: number = currentNumPRs ? currentNumPRs : 0;
    if (currentNumPRs !== results.length && results.length > -1) {
      updatedNumPRs = results.length;
    }

    console.log("github prs fetched:", results);

    return {
      name: repoName,
      numActivePRs: updatedNumPRs,
    };
  };

  // Sequential execution of each async call to get current number of PRs per repo
  for (const repoDetails of activeNumPRs) {
    const updatedPRDetails = await fetchNumPRs(repoDetails);

    if (isSuccessFetchNumPRs(updatedPRDetails)) {
      updatedNumPRs.push(updatedPRDetails);
    } else if (isFailureFetchNumPRs(updatedPRDetails)) {
      await saveToSessionStorage("waitInterval", updatedPRDetails.waitInterval);
      await saveToSessionStorage("messages", updatedPRDetails.messages);

      throw new Error(`Error fetching updated number of PRs: ${repoDetails}`);
    }
  }

  saveToLocalStorage("activeNumPRs", updatedNumPRs);

  return updatedNumPRs;
}

export {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveToSessionStorage,
  loadFromSessionStorage,
  updatePRDetails,
  initializeExtension,
};

export type { ActiveNumPRs, SubmitPRDetailsProps };
