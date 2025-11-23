import { getToast } from "../toastMessages";
import {
  handleAlertPollingAlarm,
  handleAlertRateLimitErrorAlarm,
  handleLocalStorageStepChanges,
} from "./alarms";
import { handleExtensionInstall } from "./background";
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
      const toastMessage = getToast("error", "storageHandling");
      return toast.error(toastMessage);
    } else if (message === "Rate Limit Error encountered") {
      const toastMessage = getToast("info", "rateLimitError", timeout);
      return toast.warning(toastMessage);
    }
  }

  try {
    if (alarm.name === "rateLimitErrorAlarm") {
      await handleAlertRateLimitErrorAlarm();
    }
  } catch (e) {
    let message;

    if (!isErrorMsg(e)) {
      return;
    }

    message = e.customType;

    if (message === "Alarm handling error encountered") {
      const toastMessage = getToast("error", "alarmHandling");
      return toast.error(toastMessage);
    }
  }
});

// listening for changes to current step in local storage to determine if polling alarm needs to be created or deleted
chrome.storage.onChanged.addListener(async (changes, area) => {
  await handleLocalStorageStepChanges(changes, area);
});

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === "install") {
    try {
      await handleExtensionInstall();
    } catch (e) {
      const toastMessage = getToast("error", "extensionInstall");
      return toast.error(toastMessage);
    }
  }
});
