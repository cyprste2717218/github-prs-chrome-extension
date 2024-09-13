// cache repo details and current step using chrome.storage API

async function saveLocalRepoDetails(activeNumPRs) {
  activeNumPRs.map((repoDetails) => {
    const repoName = repoDetails.name;
    const numActivePRs = repoDetails.numActivePRs;

    chrome.storage.local
      .set({ repoName: numActivePRs })
      .then(() =>
        console.log("extension local storage:", chrome.storage.local)
      );
  });
}

async function getLocalRepoDetails(activeNumPRs) {
  return activeNumPRs.map((repoDetails) => {
    const repoName = repoDetails.name;

    chrome.storage.local.get([repoName]).then((result) => {
      return {
        name: result.name,
        numActivePRs: result.numActivePRs,
      };
    });
  });
}

async function saveLocalCurrentStep(step) {
  await chrome.storage.local
    .set({ currentStep: step })
    .then(() => console.log("set the step"));
}

async function getLocalCurrentStep(step) {
  await chrome.storage.local.get(step).then((result) => {
    if (!result) {
      saveLocalCurrentStep(1);
      return 1;
    }

    console.log("Value is:", result.currentStep);
    return result.currentStep;
  });
}

async function setChromeExtensionWindowSize() {
  chrome.windows.getCurrent({ populate: true }, (window) => {
    const updateInfo = {
      width: 100,
      height: 100,
    };

    chrome.windows.update(window.id, updateInfo);
  });
}

export {
  saveLocalRepoDetails,
  getLocalRepoDetails,
  saveLocalCurrentStep,
  getLocalCurrentStep,
  setChromeExtensionWindowSize,
};
