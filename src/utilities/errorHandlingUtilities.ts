import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  FetchNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import { handleDeleteAlarm } from "@/utilities/service-worker-funcs/alarms.ts";
import { handleCreateAlarm } from "@/utilities/service-worker-funcs/alarms.ts";
import { RequestError } from "@octokit/request-error";

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

async function handleUpdatePRDetailsError(e: ErrorMsg): Promise<void> {
  async function rateLimitErrorHandler(
    timeout: number,
    message: string,
    e: ErrorMsg
  ): Promise<void> {
    console.warn(
      `Rate limit error encountered on pollingAlarm alarm occurence: ${e}`
    );

    console.log("deleting polling alarm and creating rate limit error alarm");

    console.log("deleting polling alarm");
    await handleDeleteAlarm("pollingAlarm");

    console.log("creating rate limit error alarm");
    await handleCreateAlarm("rateLimitErrorAlarm");

    throw {
      customType: message,
      waitInterval: timeout,
    };
  }

  let message;
  let timeout: number;

  if (!isErrorMsg(e)) {
    console.error(
      "Unknown error type encountered from execution of updatePRDetails func:",
      e
    );
    throw new Error("polling");
  }

  message = e.customType;
  timeout = e.waitInterval as number;

  try {
    if (message === "Storage Handling Error encountered") {
      console.error(`Error saving to chrome localStorage: ${e}`);

      throw { customType: message };
    } else if (message === "Rate Limit Error encountered") {
      await rateLimitErrorHandler(timeout, message, e);
    }
  } catch (e) {
    if (!isErrorMsg(e)) {
      return;
    }
    console.log(
      "Error during error handling process for handling polling alarm:",
      e.customType
    );

    message = "Alarm handling error encountered";
    throw { customType: message };
  }
}

async function handleRateLimitError(
  error: RequestError
): Promise<FailureFetchNumPRs> {
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

  console.log("messages:", messages);
  return {
    waitInterval: waitInterval,
    messages: messages,
  };
}

function isSuccessFetchNumPRs(obj: FetchNumPRs): obj is SuccessFetchNumPRs {
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

export {
  isErrorMsg,
  isActiveNumPRsArray,
  handleUpdatePRDetailsError,
  handleRateLimitError,
  isSuccessFetchNumPRs,
  isFailureFetchNumPRs,
};
export type { ErrorMsg };
