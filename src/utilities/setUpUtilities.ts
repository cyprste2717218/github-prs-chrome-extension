import { saveToStorage } from "../../public/background.ts";
import { updatePRDetails } from "@/utilities/repoDetailUtilities";

import type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
} from "@/models/stepHandleModels.ts";

const handleStepBack = (props: HandleStepBackProps) => {
  const { setStepState, setPAT, setActiveNumPRs, setUsername, currentStep } =
    props;

  let newStep = currentStep - 1;

  if (currentStep === 3) {
    newStep = 1;
  } else if (newStep < 1) {
    // check decrementing step isn't out of bounds
    return;
  }

  if (newStep === 1) {
    setActiveNumPRs([]);
    setPAT(undefined);
    setUsername("");

    saveToStorage("activeNumPRs", []);
    saveToStorage("patCode", undefined); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
    saveToStorage("username", "");
  }

  if (newStep === 3) {
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
  }

  if (newStep === 3) {
    saveToStorage("username", repoOwner);
    saveToStorage("patCode", initialValuePAT);
  }

  if (newStep === 4) {
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
    setPAT: props.setPAT,
    setUsername: props.setUsername,
    currentStep: props.currentStep,
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
