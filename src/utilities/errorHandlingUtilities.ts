import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { RequestError } from "@octokit/request-error";
import {
  FailureFetchNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import { saveToSessionStorage } from "./service-worker-funcs/storage-utils";
import {
  authenticatedFetch,
  unauthenticatedFetch,
} from "./polling/utils/fetchNumPRsUtils";

type ErrorMsg = {
  customType: string;
  waitInterval?: number;
};

function isActiveNumPRsArray(arr: any): arr is ActiveNumPRs[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        typeof item === "object" &&
        typeof item.name === "string" &&
        typeof item.numActivePRs === "number" &&
        (item.redirectUrl === undefined || typeof item.redirectUrl === "string")
    )
  );
}

function isErrorMsg(arg: any): arg is ErrorMsg {
  if (typeof arg !== "object" || arg === null) {
    return false;
  }

  const isCustomTypeString = typeof arg.customType === "string";
  if (!isCustomTypeString) {
    return false;
  }

  const isWaitIntervalValid =
    typeof arg.waitInterval === "undefined" ||
    typeof arg.waitInterval === "number";

  if (!isWaitIntervalValid) {
    return false;
  }

  // If customType is the specific string, waitInterval must be defined
  const requiresWaitInterval =
    arg.customType === "Rate Limit Error encountered";

  if (requiresWaitInterval) {
    // If the error requires waitInterval, check that it is defined and valid
    if (typeof arg.waitInterval === "undefined") {
      return false;
    }
  }

  return true;
}

async function checkNearPrimaryRateLimitBound(
  headers: any
): Promise<string[] | undefined> {
  const warningMessages: string[] = [];

  try {
    if (headers["x-ratelimit-remaining"]) {
      const numRequestsRemaining = Number(headers["x-ratelimit-remaining"]);

      if (numRequestsRemaining <= 300) {
        warningMessages.push(
          `Warning! Only ${numRequestsRemaining} requests remaining before you meet the primary rate limit! Perhaps alter your number of tracked repositories or reduce the frequency of requests made in settings!`
        );

        return warningMessages;
      }
      console.log(
        `Not near primary rate limit, ${numRequestsRemaining} requests remaining`
      );
    }

    return;
  } catch (e) {
    console.error("Error checking primary rate limit bound:", e);
    return;
  }
}

async function handleRequestError(
  error: RequestError
): Promise<FailureFetchNumPRs | void> {
  if (error.status === 403 || error.status === 429) {
    console.error(`HTTP ${error.status} error: Rate Limit Error has occurred`);

    const errorObj = await handleRateLimitError(error);
    if (!isFailureFetchNumPRs(errorObj)) {
      console.error("errorObj is not of type FailureFetchNumPRs");
    }

    return errorObj;
  } else if (error.status === 500) {
    // Not implementing custom handling function as for rate limit error handling as defining error object here suffices

    console.error(`HTTP ${error.status} error: Network Error has occurred`);
    const waitInterval = 2;

    const networkErrorObj: FailureFetchNumPRs = {
      type: "networkError",
      waitInterval: waitInterval,
      toastMessages: [
        `Attempts to re-establish network connection failed, will try again in ${waitInterval} minutes`,
      ],
    };

    if (!isFailureFetchNumPRs(networkErrorObj)) {
      console.error("errorObj is not of type FailureFetchNumPRs");
    }

    return networkErrorObj;
  }
  return;
}

async function handleNetworkRequestRetry(
  repo: ActiveNumPRs,
  repoOwner: string,
  repoName: string,
  maxRetries: number,
  storedPATCode?: string
) {
  /*  async function renderToast(message: string) {
     return toast.error(message);
   } */

  console.log("Handling network request retry...");

  for (let i = 0; i <= maxRetries; i++) {
    console.log("current retry iteration:", i);
    try {
      let response;

      if (storedPATCode) {
        response = await authenticatedFetch(
          repo,
          repoOwner,
          repoName,
          storedPATCode
        );
      }
      response = await unauthenticatedFetch(repo, repoOwner, repoName);

      // successful network request retry so clearing sessionStorage for network error
      await saveToSessionStorage("networkError", "Retry Success");
      return response;
    } catch (error) {
      if (i === maxRetries) {
        console.log(
          `on i value of ${i} (is of type: ${typeof i}) which is equal to max retries`
        );

        // 2). Update sessionStorage with current network error status
        await saveToSessionStorage(
          "networkError",
          "Initial Network retries failed, trying again in 2 minutes"
        );

        // await renderToast("Initial Network retries failed, check your network connection or try reloading/reinstalling the extension");

        throw error;
      }

      // Wait before retrying network request (exponential backoff)

      // 1). Create exponential delay
      const delay = Math.pow(2, i) * 1000;
      const delayInSeconds = Math.floor(delay / 1000);

      console.log(
        `Waiting for ${delayInSeconds} seconds before retrying network request...`
      );

      // 2). Updating session storage for error toast to render
      await saveToSessionStorage(
        "networkError",
        `Waiting for ${delayInSeconds} seconds before retrying network request...`
      );

      // await renderToast(`Waiting for ${Math.floor(delay / 1000)} seconds before retrying network request...`);
      // 3). Wait for the delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function handleRateLimitError(
  error: RequestError
): Promise<FailureFetchNumPRs> {
  // check if it was a primary or secondary rate limit error which was met

  let minutesWaitInterval: number = 0;
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

      minutesWaitInterval = Math.floor(secondsToWait / 60);
      messages.push(
        `Primary rate limit error, waiting ${minutesWaitInterval} minutes before making another request`
      );
    }

    // check if secondary rate limit error has occurred so timer can possibly be set for that duration (dependent on whether duration stated by 'retry-after' or 'x-ratelimit-reset' header is longer)
    if (error.response.headers["retry-after"] !== undefined) {
      const retryAfterHeaderVal: number = Number(
        error.response.headers["retry-after"]
      );

      const minutesRetryAfterHeaderVal = retryAfterHeaderVal / 60;
      if (minutesRetryAfterHeaderVal > minutesWaitInterval) {
        minutesWaitInterval = minutesRetryAfterHeaderVal;
      }

      messages.push(
        `Secondary rate limit error, waiting ${minutesWaitInterval} seconds before making another request`
      );
    }
  }

  console.log("messages:", messages);
  return {
    type: "rateLimit",
    waitInterval: minutesWaitInterval,
    toastMessages: messages,
  };
}

function isSuccessFetchNumPRs(obj: any): obj is SuccessFetchNumPRs {
  return (
    typeof obj === "object" &&
    "name" in obj &&
    "numActivePRs" in obj &&
    typeof obj.name === "string" &&
    typeof obj.numActivePRs === "number"
  );
}

function isFailureFetchNumPRs(obj: any): obj is FailureFetchNumPRs {
  return (
    typeof obj === "object" &&
    "waitInterval" in obj &&
    "toastMessages" in obj &&
    "type" in obj &&
    typeof obj.waitInterval === "number" &&
    typeof obj.type === "string" &&
    Array.isArray(obj.toastMessages) &&
    obj.toastMessages.every((item: any) => typeof item === "string")
  );
}

export {
  isErrorMsg,
  isActiveNumPRsArray,
  checkNearPrimaryRateLimitBound,
  isSuccessFetchNumPRs,
  isFailureFetchNumPRs,
  handleRequestError,
  handleNetworkRequestRetry,
};
export type { ErrorMsg };
