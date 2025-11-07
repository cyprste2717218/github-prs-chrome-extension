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
  if (details.reason === "install" || details.reason === "update") {
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

    chrome.storage.local.set(initialSettings, () => {
      // Check for chrome.runtime.lastError in case of an issue
      if (chrome.runtime.lastError) {
        console.error(
          "Error setting initial storage data on extension install:",
          chrome.runtime.lastError
        );
        return;
      }

      console.log("Initial settings saved to local storage successfully!");
    });
  }
});
