import { loadFromLocalStorage, loadFromSessionStorage } from "./storage-utils";
import { ActiveNumPRs, updatePRDetails } from "./background";

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
  async function deletePollingAlarm(): Promise<Boolean> {
    const ALARM_NAME = "pollingAlarm";

    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm !== "undefined") {
      await chrome.alarms.clear(ALARM_NAME);
      console.log(`${ALARM_NAME} alarm deleted`);

      return true;
    }

    throw new Error(`${ALARM_NAME} alarm does not exist`);
  }

  async function deleteRateLimitErrorAlarm(): Promise<Boolean> {
    const ALARM_NAME = "rateLimitErrorAlarm";

    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm !== "undefined") {
      await chrome.alarms.clear(ALARM_NAME);
      console.log(`${ALARM_NAME} alarm deleted`);
    }

    throw new Error(`${ALARM_NAME} alarm does not exist`);
  }

  if (alarmName === "pollingAlarm") {
    try {
      await deletePollingAlarm();
    } catch (deletionError) {
      console.error(`Error deleting polling alarm: ${deletionError}`);
      // To-do: escalate this error to user via toast prompting them to reinstall extension
    }
    console.log("deleted polling alarm");
  } else if (alarmName === "rateLimitErrorAlarm") {
    try {
      await deleteRateLimitErrorAlarm();
    } catch (deletionError) {
      console.error(`Error deleting rate limit error alarm: ${deletionError}`);
      // To-do: escalate this error to user via toast prompting them to reinstall extension
    }
  }
}

async function handleCreateAlarm(alarmName: string): Promise<void> {
  async function createPollingAlarm(): Promise<Boolean> {
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

    const ALARM_NAME = "pollingAlarm";

    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm === "undefined") {
      const retrievedPollingRate = await loadFromLocalStorage("pollingRate");

      const trackedRepoDetails = await loadFromLocalStorage("activeNumPRs");
      if (
        !trackedRepoDetails ||
        (trackedRepoDetails as ActiveNumPRs[]).length === 0
      ) {
        throw new Error(
          "No current repo details for tracking retrieved from localStorage"
        );
      }

      await chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: getDelay(retrievedPollingRate as number),
      });

      // doing initial fetching of repo PR details before first alarm goes off

      console.log(`${ALARM_NAME} alarm created`);
      return true;
    }

    return false;
  }

  async function createRateLimitErrorAlarm(): Promise<Boolean> {
    const ALARM_NAME = "rateLimitErrorAlarm";

    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm === "undefined") {
      const delayPeriod = await loadFromSessionStorage("delayPeriod");

      if (!delayPeriod) {
        throw new Error("No delay period retrieved from session storage");
      }

      await chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: delayPeriod as number,
      });

      console.log(`${ALARM_NAME} alarm created`);

      return true;
    }

    return false;
  }

  if (alarmName === "pollingAlarm") {
    try {
      const alarmPollingCreationResult = await createPollingAlarm();

      if (alarmPollingCreationResult === false) {
        console.log("polling alarm already exists, not creating another one");
      } else if (alarmPollingCreationResult === true) {
        console.log("created polling alarm successfully");
      }
    } catch (e) {
      console.error(`Error creating polling alarm: ${e}`);
      // To-do: escalate this error to user via toast prompting them to reinstall extension
    }
  } else if (alarmName === "rateLimitErrorAlarm") {
    try {
      const alarmRateLimitCreationResult = await createRateLimitErrorAlarm();

      if (alarmRateLimitCreationResult === false) {
        console.log(
          "rate limit error alarm already exists, not creating another one"
        );
      } else if (alarmRateLimitCreationResult === true) {
        console.log("created rate limit error alarm successfully");
      }
    } catch (e) {
      console.error(`Error creating rate limit error alarm: ${e}`);
      // To-do: escalate this error to user via toast prompting them to reinstall extension
    }
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

    if (message === "Storage Handling Error encountered") {
      console.error(`Error saving to chrome localStorage: ${e}`);

      throw new Error("Storage Handling Error encountered");
    } else if (message === "Rate Limit Error encountered") {
      console.warn(
        `Rate limit error encountered on pollingAlarm alarm occurence: ${e}`
      );

      throw {
        customType: message,
        waitInterval: timeout,
      };
    }

    console.log("deleting polling alarm and creating rate limit error alarm");

    console.log("deleting polling alarm");
    await handleDeleteAlarm("pollingAlarm");

    console.log("creating rate limit error alarm");
    await handleCreateAlarm("rateLimitErrorAlarm");

    throw new Error("Rate Limit Error encountered");
  }
}

async function handleAlertRateLimitErrorAlarm(): Promise<void> {
  console.log(
    "period elapsed for suspension from making requests due to rate limit error response"
  );
  console.log("deleting rate limit error alarm");
  await handleDeleteAlarm("rateLimitErrorAlarm");
  console.log("deleted rate limit error alarm");

  console.log("creating new polling alarm");
  await handleCreateAlarm("pollingAlarm");

  return;
}

async function handleLocalStorageTrackedReposChanges(
  changes: { [key: string]: chrome.storage.StorageChange },
  area: string
): Promise<void> {
  // checking if activeNumPRs array in local storage has changed to determine if polling alarm needs to be created or deleted
  if (area === "local" && changes.activeNumPRs) {
    const newValue = JSON.parse(changes.activeNumPRs.newValue);
    if (newValue.length === 0) {
      // if no repos being tracked, delete polling alarm if it exists

      console.log(
        "no repos being tracked, deleting polling or rate limit error alarm if it exists"
      );
      await handleDeleteAllAlarms();
    } else if (newValue.length > 0) {
      // if repos being tracked, ensure polling alarm exists

      console.log("repos being tracked, ensuring polling alarm exists");
      await handleCreateAlarm("pollingAlarm");
      console.log("ensured polling alarm exists");
    }
  }
}

export {
  handleAlertPollingAlarm,
  handleAlertRateLimitErrorAlarm,
  handleLocalStorageTrackedReposChanges,
};
