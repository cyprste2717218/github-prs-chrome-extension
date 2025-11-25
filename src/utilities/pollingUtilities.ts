import {
  loadFromLocalStorage,
  loadFromSessionStorage,
  saveToLocalStorage,
  saveToSessionStorage,
} from "./service-worker-funcs/storage-utils.js";
import { toast } from "sonner";
import type { StartPollingProps } from "@/models/utilities/PollingUtilitiesModels.ts";
import type { SubmitPRDetailsProps } from "@/models/utilities/RepoDetailUtilitiesModels.js";
import type {
  FailureFetchNumPRs,
  SuccessFetchNumPRs,
  HandleUpdateActiveNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels.js";
import type { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import type { OctokitResponse } from "@octokit/types";
import { RequestError } from "@octokit/request-error";
import { request } from "@octokit/request";
import {
  ErrorMsg,
  handleRateLimitError,
  handleUpdatePRDetailsError,
  isErrorMsg,
  isFailureFetchNumPRs,
  isSuccessFetchNumPRs,
} from "./errorHandlingUtilities.js";
import { getToast } from "./toastMessages.js";

const errorMsg: ErrorMsg = {
  customType: "",
};

async function updatePRDetails({
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps): Promise<void> {
  function checkTokenExpiry(headers: any): string | undefined {
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

  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);

  const storedPATCode = (await loadFromLocalStorage("patCode")) as
    | string
    | null;

  const handleUpdateActiveNumPRs = async ({
    activeNumPRs,
    updatedPRDetails,
    repoDetails,
  }: HandleUpdateActiveNumPRs): Promise<Boolean> => {
    const targetIndex = activeNumPRs.findIndex(
      (repo: ActiveNumPRs) => updatedPRDetails.name === repo.name
    );

    if (targetIndex !== -1) {
      // Create a NEW object (immutable update) for the target index
      activeNumPRsCopy[targetIndex] = {
        ...repoDetails, // Copy existing properties of the target object
        numActivePRs: updatedPRDetails.numActivePRs, // Apply the new property value
      };
      console.log("activeNumPRsCopy:", activeNumPRsCopy);
      await saveToLocalStorage("activeNumPRs", activeNumPRsCopy);
      return true;
    }
    return false;
  };

  // Fetch current number of PRs for given repo, using authenticated or deaunthenticated approach
  const fetchNumPRs = async (
    repo: ActiveNumPRs,
    currentFetch: number
  ): Promise<SuccessFetchNumPRs | FailureFetchNumPRs> => {
    async function retrieveFetchResults(
      owner: string,
      repoName: string,
      storedPATCode: string | null,
      currentFetch: number
    ): Promise<any> {
      async function handleRedirectLogic({
        response,
        currentFetch,
      }: {
        response: { status: number; url: string };
        currentFetch: number;
      }): Promise<void> {
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
          await fetchNumPRs(temporaryChangedRepo, currentFetch);

          return;
        } else if (redirects.type === "permanent") {
          console.log("repeating fetchNumPRs with permanent redirect url");

          const updatedActiveNumPRs = activeNumPRs;
          for (let i = 0; i < updatedActiveNumPRs.length; i++) {
            if (updatedActiveNumPRs[i].name === repoName) {
              updatedActiveNumPRs[i].redirectUrl = redirects.url;
            }
          }
          await saveToLocalStorage("activeNumPRs", updatedActiveNumPRs);
          await fetchNumPRs(repo, currentFetch);

          return;
        }
      }

      async function handleUnauthenticatedFetch(
        owner: string,
        repoName: string,
        currentFetch: number
      ): Promise<OctokitResponse<any, number>> {
        // unauthenticated request
        try {
          const response = await request(
            `GET /repos/${owner}/${repoName}/pulls`,
            {
              owner: owner,
              repo: repoName,
              headers: {
                "X-GitHub-Api-Version": "2022-11-28",
              },
              url: redirectUrl,
            }
          );

          await handleRedirectLogic({ response, currentFetch });

          return response;
        } catch (error) {
          if (!(error instanceof RequestError)) {
            console.error("Unknown error type encountered:", error);
            throw error;
          }

          const errorDetails = await handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );

          throw errorDetails;

          //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
        }
      }

      async function handleAuthenticatedFetch(
        owner: string,
        repoName: string,
        storedPATCode: string,
        currentFetch: number
      ): Promise<OctokitResponse<any, number>> {
        // authenticated request
        try {
          const requestWithAuth = request.defaults({
            headers: {
              authorization: `token ${storedPATCode}`,
            },
          });
          const response = await requestWithAuth(
            `GET /repos/${owner}/${repoName}/pulls`
          );

          console.log(
            "This is the response from authenticated fetch:",
            response
          );

          await handleRedirectLogic({ response, currentFetch });

          return response;
        } catch (error) {
          if (!(error instanceof RequestError)) {
            console.error("Unknown error type encountered:", error);
            throw error;
          }

          const errorDetails = await handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error} `
          );

          throw errorDetails;

          //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
        }
      }

      try {
        // To-do: Switch out request url for authenticated and unauthenticated requests to use the one from the redirectUrl variable if present
        if (!storedPATCode) {
          // unauthenticated request
          const results = await handleUnauthenticatedFetch(
            owner,
            repoName,
            currentFetch
          );
          return results;
        } else {
          // authenticated request
          const results = await handleAuthenticatedFetch(
            owner,
            repoName,
            storedPATCode,
            currentFetch
          );

          return results;
        }
      } catch (e) {
        return e;
      }
    }

    const repoName = repo.name;
    const owner = repoOwner;
    const currentNumPRs = repo.numActivePRs;
    const redirectUrl = repo.redirectUrl;

    const results = await retrieveFetchResults(
      owner,
      repoName,
      storedPATCode,
      currentFetch
    );

    const resultsHeaders = results.headers;
    const resultsData = results.data;

    // update number of PRs for repo if number changed

    // setting a default value in case fetch request doesn't return a number (on first load of displayed tracked repos page)

    console.log("results from fetch:", resultsData);

    if (isFailureFetchNumPRs(resultsData)) {
      return resultsData;
    }
    let updatedNumPRs: number = currentNumPRs ? currentNumPRs : 0;
    if (currentNumPRs !== resultsData.length && resultsData.length > -1) {
      updatedNumPRs = resultsData.length;
    }

    const FetchNumPRsReturnObj: SuccessFetchNumPRs = {
      name: repoName,
      numActivePRs: updatedNumPRs,
      expiry: null,
    };

    // check if current personal access token expiry is coming soon (if response header returned for the request) to flag to user
    const lastFetch = currentFetch === activeNumPRs.length - 1;
    //console.log("is last fetch:", lastFetch);

    if (lastFetch) {
      console.log("on lastfetch so checking following headers", resultsHeaders);
      const tokenExpiry = checkTokenExpiry(resultsHeaders);

      if (tokenExpiry) {
        console.log(`Token expiry date: ${tokenExpiry}`);

        const isoString = tokenExpiry.replace(" ", "T").replace(" UTC", "Z");

        const expiryDateObj = new Date(isoString);
        FetchNumPRsReturnObj["expiry"] = expiryDateObj;
      }
    }

    console.log("github prs fetched:", resultsData);

    return FetchNumPRsReturnObj;
  };

  await saveToLocalStorage("isRefreshing", true);
  // Creating in-memory copy of activeNumPRs for progressive mutation during incremental updates of number of active PRs per repo on display
  const activeNumPRsCopy: ActiveNumPRs[] = [...activeNumPRs];

  // Sequential execution of each async call to get current number of PRs per repo
  for (let i = 0; i < activeNumPRs.length; i++) {
    const currentFetch = i;
    const repoDetails = activeNumPRs[currentFetch];
    const updatedPRDetails = await fetchNumPRs(repoDetails, currentFetch);
    console.log(`fetched repoDetails`);
    console.log("length of activeNumPRs:", activeNumPRs.length);

    if (isSuccessFetchNumPRs(updatedPRDetails)) {
      const isUpdateSuccess = handleUpdateActiveNumPRs({
        activeNumPRs,
        updatedPRDetails,
        repoDetails,
      });

      if (!isUpdateSuccess) {
        const debugMessage = `Error updating new number of PRs value to storage: ${repoDetails} `;
        errorMsg.customType = "Storage Handling Error encountered";

        console.error(debugMessage);

        throw errorMsg;
      }

      if (updatedPRDetails.expiry) {
        console.log("Token expiry detected:", updatedPRDetails.expiry);
        await saveToSessionStorage("tokenExpiry", updatedPRDetails.expiry);
      }
    } else if (isFailureFetchNumPRs(updatedPRDetails)) {
      const debugMessage = `Rate Limit Error during fetching updated number of PRs, waiting for ${updatedPRDetails.waitInterval} seconds: ${repoDetails} `;

      errorMsg.customType = "Rate Limit Error encountered";
      errorMsg.waitInterval = updatedPRDetails.waitInterval;

      await saveToSessionStorage("waitInterval", updatedPRDetails.waitInterval);
      await saveToSessionStorage("messages", updatedPRDetails.messages);

      console.warn(debugMessage);

      throw errorMsg;
    }

    /*     console.log("--------------------------------");
        console.log("updated num PRs array:", updatedNumPRs);
        console.log("--------------------------------"); */
  }
  await saveToLocalStorage("isRefreshing", false);
  return;
}

async function startPolling({ activeNumPRs, repoOwner }: StartPollingProps) {
  function getDelay(sliderValue: number): number {
    // setting the delay based on the polling interval chosen (1,5 or 10 mins)

    let delayMs = 300000;

    if (sliderValue === 0) {
      delayMs = 600000;
    } else if (sliderValue === 50) {
      delayMs = 300000;
    } else if (sliderValue === 100) {
      delayMs = 60000;
    }

    return delayMs;
  }

  async function getData() {
    const delayMs = getDelay(currentSliderValue as unknown as number);

    async function handleIfTokenExpirySoon() {
      function isWithinFourDays(inputDate: Date): Boolean {
        console.log("this is the typeof inputDate", typeof inputDate);

        const now = new Date();
        const fourDaysInMilliseconds = 4 * 24 * 60 * 60 * 1000; // 345,600,000 milliseconds

        // Calculate the absolute difference in milliseconds
        const timeDifference = Math.abs(now.getTime() - inputDate.getTime());

        // Compare the difference to the 4-day threshold
        return timeDifference <= fourDaysInMilliseconds;
      }

      const tokenExpiry = (await loadFromSessionStorage(
        "tokenExpiry"
      )) as Date | null;

      console.log(
        "tokenExpiry from session storage in handleIfTokenExpirySoon:",
        tokenExpiry
      );

      if (tokenExpiry) {
        console.log("tokenExpiry before conversion", tokenExpiry);
        const convertedTokenExpiry = new Date(tokenExpiry);
        console.log("convertedTokenExpiry", convertedTokenExpiry);
        const nearExpiry = isWithinFourDays(convertedTokenExpiry);

        if (nearExpiry) {
          const toastMessage = getToast(
            "info",
            "upcomingTokenExpiry",
            undefined,
            convertedTokenExpiry.toString()
          );
          return toast.info(toastMessage);
        }

        console.log("token expiry not within 4 days, no toast triggered");
        return;
      }
    }

    try {
      console.log(`polling github api every ${delayMs / 60000} minutes`);

      await updatePRDetails({
        activeNumPRs,
        repoOwner,
      });

      await handleIfTokenExpirySoon();

      console.log(`finished polling github api`);
    } catch (error) {
      console.error("Error during polling github api:", error);

      if (!isErrorMsg(error)) {
        console.error("Unknown error type encountered from polling:", error);
        throw new Error("polling");
      }

      await handleUpdatePRDetailsError(error);
    }
  }

  const currentSliderValue: string | null =
    await loadFromLocalStorage("pollingRate");

  // const delay = getDelay(parseInt(currentSliderValue as string));

  // initial call to get current number of open PRs across repos before commencing fetches at regular intervals
  await getData()
    .then(() => console.log(`initial call to github api complete`))
    .catch((error) => {
      console.error("Error during initial call to github api:", error);
      toast.error(
        "Error during initial call to github api, if the issue persists try reinstalling the extension"
      );
    });
}

export { startPolling, updatePRDetails };
