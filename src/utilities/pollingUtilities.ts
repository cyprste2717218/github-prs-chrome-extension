import {
  loadFromLocalStorage,
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

const errorMsg: ErrorMsg = {
  customType: "",
};

async function updatePRDetails({
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps): Promise<void> {
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
    repo: ActiveNumPRs
  ): Promise<SuccessFetchNumPRs | FailureFetchNumPRs> => {
    async function retrieveFetchResults(
      owner: string,
      repoName: string,
      storedPATCode: string | null
    ): Promise<any> {
      async function handleRedirectLogic({
        response,
      }: {
        response: { status: number; url: string };
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
          await fetchNumPRs(temporaryChangedRepo);

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
          await fetchNumPRs(repo);

          return;
        }
      }

      async function handleUnauthenticatedFetch(
        owner: string,
        repoName: string
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

          await handleRedirectLogic({ response });

          return response.data;
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
        storedPATCode: string
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

          await handleRedirectLogic({ response });

          return response.data;
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

      try {
        // To-do: Switch out request url for authenticated and unauthenticated requests to use the one from the redirectUrl variable if present
        if (!storedPATCode) {
          // unauthenticated request
          const results = await handleUnauthenticatedFetch(owner, repoName);
          return results;
        } else {
          // authenticated request
          const results = await handleAuthenticatedFetch(
            owner,
            repoName,
            storedPATCode
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

    const results = await retrieveFetchResults(owner, repoName, storedPATCode);

    // update number of PRs for repo if number changed

    // setting a default value in case fetch request doesn't return a number (on first load of displayed tracked repos page)

    console.log("results from fetch:", results);

    if (isFailureFetchNumPRs(results)) {
      return results;
    }
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

  // Creating in-memory copy of activeNumPRs for progressive mutation during incremental updates of number of active PRs per repo on display
  const activeNumPRsCopy: ActiveNumPRs[] = [...activeNumPRs];

  // Sequential execution of each async call to get current number of PRs per repo
  for (const repoDetails of activeNumPRs) {
    const updatedPRDetails = await fetchNumPRs(repoDetails);
    console.log(`fetched repoDetails`);
    console.log("length of activeNumPRs:", activeNumPRs.length);

    if (isSuccessFetchNumPRs(updatedPRDetails)) {
      const isUpdateSuccess = handleUpdateActiveNumPRs({
        activeNumPRs,
        updatedPRDetails,
        repoDetails,
      });
      if (!isUpdateSuccess) {
        const debugMessage = `Error updating new number of PRs value to storage: ${repoDetails}`;
        errorMsg.customType = "Storage Handling Error encountered";

        console.error(debugMessage);

        throw errorMsg;
      }
    } else if (isFailureFetchNumPRs(updatedPRDetails)) {
      const debugMessage = `Rate Limit Error during fetching updated number of PRs, waiting for ${updatedPRDetails.waitInterval} seconds: ${repoDetails}`;

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

    try {
      console.log(`polling github api every ${delayMs / 60000} minutes`);
      await updatePRDetails({
        activeNumPRs,
        repoOwner,
      });
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
