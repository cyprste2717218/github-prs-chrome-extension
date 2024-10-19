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

  saveToStorage("step", newStep);

  if (newStep === 2) {
    setPAT(undefined);
    saveToStorage("patCode", undefined); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
  }

  if (newStep === 2 || newStep === 3) {
    setActiveNumPRs([]);
    saveToStorage("activeNumPRs", []);
  }
};

const handleStepForward = (props: HandleStepForwardProps) => {
  const {
    setStepState,
    setActiveNumPRs,
    setHasPAT,
    repoOwner,
    currentStep,
    activeNumPRs,
    initialValuePAT,
  } = props;

  const newStep = currentStep + 1;

  // check incrementing step isn't out of bounds
  if (!(newStep > 4)) {
    setStepState(newStep);
  }

  if (newStep === 2) {
    setHasPAT(initialValuePAT);
  }

  if (activeNumPRs.length !== 0) {
    console.log("activeNumPRs array is not empty");
    updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
    saveToStorage("activeNumPRs", activeNumPRs);
  } else {
    console.log("activeNumPRs array is empty");
  }

  if (newStep === 3) {
    saveToStorage("step", newStep);
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
    setHasPAT: props.setHasPAT,
    repoOwner: props.repoOwner,
    activeNumPRs: props.activeNumPRs,
    currentStep: props.currentStep,
    initialValuePAT: props.initialValuePAT,
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
