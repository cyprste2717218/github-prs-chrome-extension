// @ts-ignore

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    console.log("Extension installed for the first time");
    initializeExtension();
  }
});

function initializeExtension() {
  // set intitial state variable default values on first install, chrome version update or extension update for setting current step react state]

  // @ts-ignore
  chrome.storage.local.set({
    step: 1,
    username: "",
    repoDetails: null,
    activeNumPRs: [],
  });
}

function loadFromStorage<T>(key: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    // @ts-ignore
    chrome.storage.local.get([key], (dict: any) => {
      let result;
      try {
        result = JSON.parse(dict[key]);
      } catch (e) {
        result = dict[key];
      }
      resolve(result || null);
    });
  });
}

function saveToStorage<T>(key: string, value: T | null): Promise<void> {
  return new Promise<void>((resolve) => {
    // @ts-ignore
    chrome.storage.local.set(
      {
        [key]: JSON.stringify(value),
      },
      resolve
    );
  });
}

/* async function saveLocalRepoDetails(activeNumPRs: ActiveNumPRs[]) {
  activeNumPRs.map((repoDetails: ActiveNumPRs) => {
    const repoName = repoDetails.name;
    const numActivePRs = repoDetails.numActivePRs;

    chrome.storage.local
      .set({ repoName: numActivePRs })
      .then(() =>
        console.log("extension local storage:", chrome.storage.local)
      );
  });
} */

/* async function getLocalRepoDetails(activeNumPRs: ActiveNumPRs[]) {
  return activeNumPRs.map((repoDetails: ActiveNumPRs) => {
    const repoName = repoDetails.name;

    chrome.storage.local.get([repoName]).then((result) => {
      return {
        name: result.name,
        numActivePRs: result.numActivePRs,
      };
    });
  });
} */

/* async function saveLocalCurrentStep(step: number) {
  await chrome.storage.local
    .set({ currentStep: step })
    .then(() => console.log("set the step"));
} */

/* async function setChromeExtensionWindowSize() {
  chrome.windows.getCurrent({ populate: true }, (window) => {
    const updateInfo = {
      width: 100,
      height: 100,
    };

    chrome.windows.update(window.id as number, updateInfo);
  });
} */

export {
  /*   saveLocalRepoDetails,
  getLocalRepoDetails,
  saveLocalCurrentStep,
  setChromeExtensionWindowSize, */
  saveToStorage,
  loadFromStorage,
};
