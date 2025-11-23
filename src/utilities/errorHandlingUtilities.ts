import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { handleDeleteAlarm } from "@/utilities/service-worker-funcs/alarms.ts";
import { handleCreateAlarm } from "@/utilities/service-worker-funcs/alarms.ts";

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

export { isErrorMsg, isActiveNumPRsArray, handleUpdatePRDetailsError };
export type { ErrorMsg };
