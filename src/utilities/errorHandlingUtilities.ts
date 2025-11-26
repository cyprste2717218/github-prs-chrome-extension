import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";

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

async function handleRateLimitError(error: any): Promise<FailureFetchNumPRs> {
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

      minutesWaitInterval = secondsToWait / 60;
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
    typeof obj.waitInterval === "number" &&
    Array.isArray(obj.toastMessages) &&
    obj.toastMessages.every((item: any) => typeof item === "string")
  );
}

export {
  isErrorMsg,
  isActiveNumPRsArray,
  handleRateLimitError,
  isSuccessFetchNumPRs,
  isFailureFetchNumPRs,
};
export type { ErrorMsg };
