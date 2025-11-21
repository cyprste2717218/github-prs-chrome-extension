import {
  handleAlertPollingAlarm,
  handleAlertRateLimitErrorAlarm,
  handleLocalStorageTrackedReposChanges,
} from "./alarm-utils";
import { saveAllToLocalStorage } from "./storage-utils";
import { toast } from "sonner";

// handling when different alarm types go off
chrome.alarms.onAlarm.addListener(async (alarm) => {
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

  try {
    if (alarm.name === "pollingAlarm") {
      await handleAlertPollingAlarm();
    }
  } catch (e) {
    let message;
    let timeout: number;

    if (!isErrorMsg(e)) {
      return;
    }

    message = e.customType;
    timeout = e.waitInterval as number;

    if (message === "Storage Handling Error encountered") {
      return toast.error(
        "Storage misconfiguration error encountered, try reloading or if that doesn't work reinstalling the extension"
      );
    } else if (message === "Rate Limit Error encountered") {
      return toast.warning(
        `You've hit a rate limit! Waiting ${timeout} seconds before trying again`
      );
    }
  }

  try {
    if (alarm.name === "rateLimitErrorAlarm") {
      await handleAlertRateLimitErrorAlarm();
    }
  } catch (e) {
    return toast.warning("");
  }
});

// listening for changes to activeNumPRs array in local storage to determine if polling alarm needs to be created or deleted
chrome.storage.onChanged.addListener(async (changes, area) => {
  await handleLocalStorageTrackedReposChanges(changes, area);
});

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === "install") {
    console.log("GitHub PR Tracker Extension installed or updated!");

    const initialSettings = {
      step: 1, // Initial step set to 1
      username: "", // Initial empty username
      pollingRate: 50, // Default polling rate
      reposToggled: false, // Default state for all repos selected or not on selection screen
      numPageResults: 0, // Default number of repo result pages
      activeResultsPage: 1, // Default page number,
      patCode: null, // Initial null PAT,
      repoDetails: null, // Initial null value regarding repository details tracked
      activeNumPRs: [], // Initial empty array for active PRs
    };

    await saveAllToLocalStorage(initialSettings)
      .then(() => {
        console.log("Initial settings saved to local storage successfully!");
      })
      .catch((error) => {
        console.error(
          `Error saving initial settings to local storage: ${error}`
        );
      });
  }
});
