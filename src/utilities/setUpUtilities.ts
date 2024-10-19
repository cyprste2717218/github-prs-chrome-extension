import { saveToStorage } from "../../public/background.ts";
import { updatePRDetails } from "@/utilities/repoDetailUtilities";

import type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
} from "@/models/stepHandleModels.ts";

const handleStepBack = (props: HandleStepBackProps) => {
  const { setStepState, setPAT, setActiveNumPRs, currentStep } = props;

  const newStep = currentStep - 1;
  // check decrementing step isn't out of bounds
  if (!(newStep < 1)) {
    setStepState(newStep);
  }

  saveToStorage("step", currentStep - 1);

  if (currentStep === 2) {
    setPAT(undefined);
    saveToStorage("patCode", undefined); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
  }

  if (currentStep === 2 || currentStep === 3) {
    setActiveNumPRs([]);
    saveToStorage("activeNumPRs", []);
  }

  if (currentStep === 1) {
    setPAT(undefined);
  }
};

const handleStepForward = (props: HandleStepForwardProps) => {
  const {
    setStepState,
    setActiveNumPRs,
    repoOwner,
    currentStep,
    activeNumPRs,
  } = props;

  const newStep = currentStep + 1;

  // check incrementing step isn't out of bounds
  if (!(newStep > 4)) {
    setStepState(newStep);
  }

  if (activeNumPRs.length !== 0) {
    console.log("activeNumPRs array is not empty");
    updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
    saveToStorage("activeNumPRs", activeNumPRs);
  } else {
    console.log("activeNumPRs array is empty");
  }

  if (currentStep === 3) {
    setStepState(currentStep + 1);
    saveToStorage("step", currentStep + 1);
  }
};

const handleStepChange = (props: HandleStepChangeProps) => {
  const { stepOperation } = props;

  // props for passing to relevant step change handler
  const backButtonOperationProps = {
    setStepState: props.setStepState,
    setActiveNumPRs: props.setActiveNumPRs,
    setPAT: props.setPAT,
    currentStep: props.currentStep,
  };

  const nextButtonOperationsProps = {
    setStepState: props.setStepState,
    setActiveNumPRs: props.setActiveNumPRs,
    repoOwner: props.repoOwner,
    activeNumPRs: props.activeNumPRs,
    currentStep: props.currentStep,
  };

  switch (stepOperation) {
    case "stepBack":
      handleStepBack(backButtonOperationProps);
      break;
    case "stepFoward":
      handleStepForward(nextButtonOperationsProps);
      break;
    default:
      break;
  }
};

export { handleStepChange };
