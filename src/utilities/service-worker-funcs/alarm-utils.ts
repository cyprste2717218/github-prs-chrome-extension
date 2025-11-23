import type {
  StorageAlarm,
  StoragePollingAlarm,
  StorageRateLimitErrorAlarm,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import { loadFromLocalStorage, loadFromSessionStorage } from "./storage-utils";
import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";

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
        const retrievedPollingRate = await loadFromLocalStorage("pollingRate");
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

export { createAlarm, deleteAlarm, isActiveNumPRsArray };
