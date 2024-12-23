import { saveToStorage } from "../../public/background.ts";
import { updatePRDetails } from "@/utilities/repoDetailUtilities";

import type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
} from "@/models/stepHandleModels.ts";

const handleStepBack = (props: HandleStepBackProps) => {
  const {
    setStepState,
    setPAT,
    setActiveNumPRs,
    setRepoDetails,
    setUsername,
    setNumPageResults,
    setDisplayWarning,
    currentStep,
    initialValuePAT,
  } = props;

  let newStep = currentStep - 1;

  if (currentStep === 3) {
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
    setNumPageResults(null);

    saveToStorage("activeNumPRs", []);
    saveToStorage("repoDetails", null);
    saveToStorage("patCode", initialValuePAT); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
    saveToStorage("username", "");
    saveToStorage("numPageResults", null);
  }

  if (newStep === 3) {
    // check navigation to previous step is intended
    setDisplayWarning(true);

    setActiveNumPRs([]);
    saveToStorage("activeNumPRs", []);
  }

  // set step to new decremented value
  setStepState(newStep);
  saveToStorage("step", newStep);
};

const handleStepForward = (props: HandleStepForwardProps) => {
  const {
    setStepState,
    setActiveNumPRs,
    setPAT,
    repoOwner,
    currentStep,
    activeNumPRs,
    initialValuePAT,
  } = props;

  const newStep = currentStep + 1;

  // check incrementing step isn't out of bounds
  if (newStep > 4) {
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
      updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
      saveToStorage("activeNumPRs", activeNumPRs);
    } else {
      console.log("activeNumPRs array is empty");
    }
  }

  // set step to new incremented value
  setStepState(newStep);
  saveToStorage("step", newStep);
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
    currentStep: props.currentStep,
    initialValuePAT: props.initialValuePAT,
  };

  const nextButtonOperationsProps = {
    setStepState: props.setStepState,
    setActiveNumPRs: props.setActiveNumPRs,
    setPAT: props.setPAT,
    repoOwner: props.repoOwner,
    activeNumPRs: props.activeNumPRs,
    currentStep: props.currentStep,
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
