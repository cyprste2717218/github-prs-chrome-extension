import { loadFromLocalStorage, loadFromSessionStorage } from "./storage-utils";
import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { updatePRDetails } from "./background";

type StoragePollingAlarm = {
  retrievedPollingRate: number;
  trackedRepoDetails: ActiveNumPRs[];
  alarmType: string;
};

type StorageRateLimitErrorAlarm = {
  delayPeriod: number;
  alarmType: string;
};

type StorageAlarm = StoragePollingAlarm | StorageRateLimitErrorAlarm;

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

async function handleDeleteAllAlarms(): Promise<void> {
  console.log("clearing all alarms");
  await chrome.alarms.clearAll();
  console.log("all alarms cleared");
}

async function handleDeleteAlarm(alarmName: string): Promise<void> {
  async function deleteAlarm(alarmName: string): Promise<Boolean> {
    const ALARM_NAME = alarmName;

    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm !== "undefined") {
      await chrome.alarms.clear(ALARM_NAME);
      console.log(`${ALARM_NAME} alarm deleted`);

      return true;
    }

    throw new Error(`${ALARM_NAME} alarm does not exist`);
  }

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
  async function createAlarm(alarmName: string): Promise<Boolean> {
    async function fetchAlarmDetails(
      alarmName: string
    ): Promise<[Boolean, number]> {
      function getDelay(sliderValue: number): number {
        // setting the delay based on the polling interval chosen (1,5 or 10 mins)

        let delayMs = 300000;

        if (sliderValue === 0) {
          delayMs = 10;
        } else if (sliderValue === 50) {
          delayMs = 5;
        } else if (sliderValue === 100) {
          delayMs = 1;
        }

        return delayMs;
      }

      async function fetchRequiredStorageData(
        alarmName: string
      ): Promise<StorageAlarm> {
        if (alarmName === "pollingAlarm") {
          const retrievedPollingRate =
            await loadFromLocalStorage("pollingRate");
          const trackedRepoDetails = await loadFromLocalStorage("activeNumPRs");

          const fetchedData = {
            retrievedPollingRate: retrievedPollingRate as number,
            trackedRepoDetails: trackedRepoDetails as ActiveNumPRs[],
            alarmType: alarmName as string,
          };

          return fetchedData;
        } else if (alarmName === "rateLimitErrorAlarm") {
          const delayPeriod = await loadFromSessionStorage("delayPeriod");

          const fetchedData = {
            delayPeriod: delayPeriod as number,
            alarmType: alarmName as string,
          };

          return fetchedData;
        } else {
          console.error(
            `Invalid alarmName '${alarmName}' passed when fetching data needed to create alarm`
          );
          throw new Error("Alarm handling error encountered");
        }
      }

      function isStoragePollingAlarm(
        result: StorageAlarm
      ): result is StoragePollingAlarm {
        return result.alarmType === "pollingAlarm";
      }

      function isStorageRateLimitAlarm(
        result: StorageAlarm
      ): result is StorageRateLimitErrorAlarm {
        return result.alarmType === "rateLimitErrorAlarm";
      }

      let period;

      const fetchedReqData: StorageAlarm =
        await fetchRequiredStorageData(alarmName);

      console.log("fetchedReqData:", fetchedReqData);
      if (isStoragePollingAlarm(fetchedReqData)) {
        const trackedRepoDetails = fetchedReqData["trackedRepoDetails"];
        const retrievedPollingRate = fetchedReqData["retrievedPollingRate"];

        const trackedRepoDetailsConstraints =
          !trackedRepoDetails ||
          (trackedRepoDetails as ActiveNumPRs[]).length === 0;
        period = getDelay(retrievedPollingRate);

        return [trackedRepoDetailsConstraints, period];
      } else if (isStorageRateLimitAlarm(fetchedReqData)) {
        const delayPeriod = fetchedReqData["delayPeriod"];
        period = delayPeriod;

        return [!delayPeriod, period];
      } else {
        console.error(
          "Retrieved alarm details don't match rate limit or polling alarm types"
        );
        throw new Error("Alarm handling error encountered");
      }
    }

    const ALARM_NAME = alarmName;

    /* Fetch data from storage needing checking for correct creation of alarm type,
   
    - retrieving timeout period to wait for creating rate limit error alarm (i.e. fetching from chrome.sessionStorage)
    
    - or polling frequency for usual polling alarm creation (chrome.localStorage)
    */
    const fetchedAlarmDetails = await fetchAlarmDetails(alarmName);

    const fetchedConditions = fetchedAlarmDetails[0];
    const fetchedPeriod = fetchedAlarmDetails[1];

    if (!fetchedPeriod) {
      throw new Error("No period fetched for alarm scheduling");
    }

    const alarm = await chrome.alarms.get(ALARM_NAME);

    if (typeof alarm === "undefined") {
      if (fetchedConditions) {
        const errorMsg =
          alarmName === "pollingAlarm"
            ? "No current repo details for tracking retrieved from localStorage"
            : "No delay period retrieved from session storage";
        throw new Error(errorMsg);
      }

      await chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: fetchedPeriod,
      });

      // doing initial fetching of repo PR details before first alarm goes off

      console.log(`${ALARM_NAME} alarm created`);
      return true;
    }

    return false;
  }

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
