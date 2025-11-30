import { isErrorMsg } from "../errorHandlingUtilities";
import { getToast } from "../toastMessages";
import { handleAlertAlarm, handleLocalStorageStepChanges } from "./alarms";
import { handleExtensionInstall } from "./background";
import { toast } from "sonner";

// handling when different alarm types go off
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    await handleAlertAlarm(alarm.name);
  } catch (e) {
    let message;
    let timeout: number;

    if (!isErrorMsg(e)) {
      return;
    }

    message = e.customType;
    timeout = e.waitInterval as number;

    switch (message) {
      case "Storage Handling Error encountered": {
        const toastMessage = getToast("error", "storageHandling");
        return toast.error(toastMessage);
      }
      case "Rate Limit Error encountered": {
        const toastMessage = getToast("info", "rateLimitError", timeout);
        return toast.warning(toastMessage);
      }
      case "Alarm handling error encountered": {
        const toastMessage = getToast("error", "alarmHandling");
        return toast.error(toastMessage);
      }
      default: {
        return;
      }
    }
  }
});

// listening for changes to current step in local storage to determine if polling alarm needs to be created or deleted
chrome.storage.onChanged.addListener(async (changes, area) => {
  await handleLocalStorageStepChanges(changes, area);
});

// listening for changes to sessionStorage when rate limit occurs requiring error toast display
/* chrome.storage.onChanged.addListener(async (changes, area) => {
  await handleSessionStorageChanges(changes, area);
}); */

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
