import { loadFromStorage, saveToStorage } from "../../public/background.ts";

import type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
} from "@/models/stepHandleModels.ts";
import { clearPolling, startPolling } from "./pollingUtilities.ts";

const handleStepBack = async (props: HandleStepBackProps) => {
  const {
    setStepState,
    setPAT,
    setActiveNumPRs,
    setRepoDetails,
    setUsername,
    setNumPageResults,
    setDisplayWarning,
    setReposToggled,
    setIntervalId,
    currentStep,
    goalStep,
    initialValuePAT,
  } = props;

  // To-do: fix this logic so newStep is set in the line below to the value of goalStep if passed through
  let newStep = goalStep ? goalStep : currentStep - 1;

  if (currentStep === 3 || currentStep === 5) {
    newStep = 1;
  } else if (newStep < 1) {
    // check decrementing step isn't out of bounds
    return;
  }

  if (newStep === 1) {
    setActiveNumPRs([]);
    setRepoDetails(null);
    setPAT(initialValuePAT);
    setUsername("");
    setNumPageResults(0);

    saveToStorage("activeNumPRs", []);
    saveToStorage("repoDetails", null);
    saveToStorage("patCode", initialValuePAT); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
    saveToStorage("username", "");
    saveToStorage("numPageResults", null);
  }

  if (newStep === 3) {
    // check navigation to previous step is intended
    setDisplayWarning(true);
    setReposToggled(false);
    setActiveNumPRs([]);

    const storedIntervalId: NodeJS.Timeout | null =
      await loadFromStorage("intervalId");
    if (!storedIntervalId) {
      throw new Error(
        "storedIntervalId is null when trying to access to close current polling queue"
      );
    }

    clearPolling(storedIntervalId);
    console.log("the retrieved interval ID was:", storedIntervalId);
    setIntervalId(null);

    saveToStorage("activeNumPRs", []);
    saveToStorage("reposToggled", false);
  }

  // set step to new decremented value
  setStepState(newStep);
  saveToStorage("step", newStep);

  console.log("this is the newStep on going back", newStep);
};

const handleStepForward = (props: HandleStepForwardProps) => {
  const {
    setStepState,
    setActiveNumPRs,
    setPAT,
    setIntervalId,
    repoOwner,
    currentStep,
    goalStep,
    activeNumPRs,
    initialValuePAT,
  } = props;

  const newStep = goalStep ? goalStep : currentStep + 1;

  // check incrementing step isn't out of bounds when settings page is not being requested to be loaded
  if (newStep > 4 && !goalStep) {
    return;
  }

  if (newStep === 2) {
    setPAT(initialValuePAT);
    saveToStorage("patCode", initialValuePAT);
  }

  if (newStep === 3) {
    saveToStorage("username", repoOwner);
    saveToStorage("patCode", initialValuePAT);
  }

  if (newStep === 4 || newStep === 3) {
    if (activeNumPRs.length !== 0) {
      console.log("activeNumPRs array is not empty");

      startPolling({ setActiveNumPRs, setIntervalId, activeNumPRs, repoOwner });
      saveToStorage("activeNumPRs", activeNumPRs);
    } else {
      console.log("activeNumPRs array is empty");
    }
  }

  // set step to new incremented value
  setStepState(newStep);
  saveToStorage("step", newStep);

  console.log("this is the newStep on going forward", newStep);
};

const handleStepChange = (props: HandleStepChangeProps) => {
  const { stepOperation } = props;

  // props for passing to relevant step change handler
  const backButtonOperationProps = {
    setStepState: props.setStepState,
    setActiveNumPRs: props.setActiveNumPRs,
    setRepoDetails: props.setRepoDetails,
    setPAT: props.setPAT,
    setUsername: props.setUsername,
    setNumPageResults: props.setNumPageResults,
    setDisplayWarning: props.setDisplayWarning,
    setReposToggled: props.setReposToggled,
    setIntervalId: props.setIntervalId,
    currentStep: props.currentStep,
    initialValuePAT: props.initialValuePAT,
    intervalId: props.intervalId,
  };

  const nextButtonOperationsProps = {
    setStepState: props.setStepState,
    setActiveNumPRs: props.setActiveNumPRs,
    setPAT: props.setPAT,
    setIntervalId: props.setIntervalId,
    repoOwner: props.repoOwner,
    activeNumPRs: props.activeNumPRs,
    currentStep: props.currentStep,
    goalStep: props?.goalStep,
    initialValuePAT: props.initialValuePAT,
  };

  switch (stepOperation) {
    case "stepBack":
      handleStepBack(backButtonOperationProps);
      break;
    case "stepForward":
      handleStepForward(nextButtonOperationsProps);
      break;
    default:
      break;
  }
};

export { handleStepChange };
