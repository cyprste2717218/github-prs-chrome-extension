import { loadFromLocalStorage } from "./storage-utils";
import { updatePRDetails } from "../pollingUtilities";
import { createAlarm, deleteAlarm, isActiveNumPRsArray } from "./alarm-utils";

async function handleDeleteAllAlarms(): Promise<void> {
  console.log("clearing all alarms");
  await chrome.alarms.clearAll();
  console.log("all alarms cleared");
}

async function handleDeleteAlarm(alarmName: string): Promise<void> {
  try {
    await deleteAlarm(alarmName);
  } catch (e) {
    console.error(`Error deleting ${alarmName}: ${e}`);

    if (alarmName === "pollingAlarm") {
      // To-do: add retry logic for deleting polling alarm
    }

    throw new Error("Alarm handling error encountered");
  }
  console.log(`deleted ${alarmName}`);
}

async function handleCreateAlarm(alarmName: string): Promise<void> {
  try {
    const alarmCreationResult = await createAlarm(alarmName);

    if (alarmCreationResult === false) {
      console.log(`${alarmName} already exists, not creating another one`);
    } else if (alarmCreationResult === true) {
      console.log(`created ${alarmName} successfully`);
    }
  } catch (e) {
    console.error(`Error during creation of ${alarmName} alarm: ${e}`);
    throw new Error(`${alarmName} handling error encountered`);
  }
}

async function handleAlertPollingAlarm(): Promise<void> {
  type ErrorMsg = {
    customType: string;
    waitInterval?: number;
  };

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

  const now = new Date();
  const isoString = now.toISOString();

  console.log(`pollingAlarm alarm triggered at ${isoString}`);
  const activeNumPRs = await loadFromLocalStorage("activeNumPRs");
  const repoOwner = await loadFromLocalStorage("username");

  if (
    typeof repoOwner !== "string" ||
    isActiveNumPRsArray(activeNumPRs) === false
  ) {
    console.error(
      "Either/and repoOwner and activeNumPRs not correct types when retrieved from extension localStorage"
    );

    throw new Error("Storage Handling Error encountered");

    // To-do: escalate this error to user via toast prompting them to reinstall extension
  }

  try {
    await updatePRDetails({ activeNumPRs, repoOwner });

    console.log(
      "saved updated PR details to extension localStorage successfully"
    );
    return;
  } catch (e) {
    let message;
    let timeout: number;

    if (!isErrorMsg(e)) {
      return;
    }

    message = e.customType;
    timeout = e.waitInterval as number;

    try {
      if (message === "Storage Handling Error encountered") {
        console.error(`Error saving to chrome localStorage: ${e}`);

        message = "Storage Handling Error encountered";
        throw { customType: message };
      } else if (message === "Rate Limit Error encountered") {
        console.warn(
          `Rate limit error encountered on pollingAlarm alarm occurence: ${e}`
        );

        console.log(
          "deleting polling alarm and creating rate limit error alarm"
        );

        console.log("deleting polling alarm");
        try {
          await handleDeleteAlarm("pollingAlarm");
        } catch (e) {
          console.log("Error encountered during deletion of polling alarm");

          message = "Alarm handling error encountered";
          throw { customType: message };
        }

        console.log("creating rate limit error alarm");
        try {
          await handleCreateAlarm("rateLimitErrorAlarm");
        } catch (e) {
          console.log(
            "Error encountered during creation of rate limit error alarm"
          );

          message = "Alarm handling error encountered";
          throw { customType: message };
        }

        throw {
          customType: message,
          waitInterval: timeout,
        };
      } else {
        console.warn(
          "Retrieved error message in alert polling alarm handling doesn't match any available cases"
        );

        message = "Invalid Error Message";
        throw {
          customType: message,
        };
      }
    } catch (e) {
      if (!isErrorMsg(e)) {
        return;
      }
      console.log(
        "Error during error handling process for handling polling alarm trigger run:",
        e.customType
      );

      message = "Alarm handling error encountered";
      throw { customType: message };
    }
  }
}

async function handleAlertRateLimitErrorAlarm(): Promise<void> {
  console.log(
    "period elapsed for suspension from making requests due to rate limit error response"
  );

  try {
    console.log("deleting rate limit error alarm");
    try {
      await handleDeleteAlarm("rateLimitErrorAlarm");
      console.log("deleted rate limit error alarm");
    } catch (e) {
      console.log("Error during deletion of rate limit error alarm:", e);

      throw new Error("Alarm handling error encountered");
    }

    console.log("creating new polling alarm");
    try {
      await handleCreateAlarm("pollingAlarm");
      console.log("created new polling alarm");
    } catch (e) {
      console.log("Error during creation of polling alarm:", e);

      throw new Error("Alarm handling error encountered");
    }
  } catch (e) {
    console.error(
      "Issue handling deletion of old rate limit error alarm followed by creation of new polling alarm following rate limit error period having elapsed"
    );

    throw new Error("Alarm handling error encountered");
  }

  return;
}

async function handleLocalStorageStepChanges(
  changes: { [key: string]: chrome.storage.StorageChange },
  area: string
): Promise<void> {
  // checking if localStorage indicates on repo tracking display screen, to determine if polling alarm needs to be created or deleted
  if (area === "local" && changes.step) {
    const newValue = JSON.parse(changes.step.newValue);
    console.log("the step is:", newValue);

    if (newValue !== 4) {
      // if not on repo track display screen, delete polling alarm if it exists

      console.log(
        "no repos being tracked, deleting polling or rate limit error alarm if it exists"
      );
      await handleDeleteAllAlarms();
    } else if (newValue === 4) {
      // if on repo track display screen, ensure polling alarm exists

      console.log(
        "on repo track display screen, ensuring polling alarm exists"
      );
      await handleCreateAlarm("pollingAlarm");
      console.log("ensured polling alarm exists");
    }
  }
}

export {
  handleAlertPollingAlarm,
  handleAlertRateLimitErrorAlarm,
  handleLocalStorageStepChanges,
};
