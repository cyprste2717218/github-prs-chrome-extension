import {
  handleAlertPollingAlarm,
  handleAlertRateLimitErrorAlarm,
  handleLocalStorageTrackedReposChanges,
} from "./alarm-utils";

// handling when different alarm types go off
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "pollingAlarm") {
    await handleAlertPollingAlarm();
  } else if (alarm.name === "rateLimitErrorAlarm") {
    await handleAlertRateLimitErrorAlarm();
  }
});

// listening for changes to activeNumPRs array in local storage to determine if polling alarm needs to be created or deleted
chrome.storage.onChanged.addListener(async (changes, area) => {
  await handleLocalStorageTrackedReposChanges(changes, area);
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    console.log("Extension installed for the first time");
  }
});
