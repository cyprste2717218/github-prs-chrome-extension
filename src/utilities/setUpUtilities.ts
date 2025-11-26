import type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
} from "@/models/utilities/stepHandleModels.ts";
import { startPolling } from "./polling/polling.ts";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  saveToSessionStorage,
} from "./service-worker-funcs/storage-utils.ts";

const handleStepBack = async (props: HandleStepBackProps) => {
  const {
    /*     setStepState,
        setPAT,
        setActiveNumPRs,
        setRepoDetails,
        setUsername,
        setNumPageResults,
        setDisplayWarning,
        setReposToggled, */
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
    saveToLocalStorage("username", "");
    saveToLocalStorage("repoDetails", null);
    saveToLocalStorage("activeNumPRs", []);
    saveToLocalStorage("patCode", initialValuePAT);
    saveToLocalStorage("numPageResults", 0);
    saveToSessionStorage("tokenExpiry", null);

    // setUsername("");
    //setActiveNumPRs([]);
    //setRepoDetails(null);
    //setPAT(initialValuePAT);
    //setNumPageResults(0);
  }

  if (newStep === 3) {
    // check navigation to previous step is intended
    //setDisplayWarning(true);
    //setReposToggled(false);
    //setActiveNumPRs([]);

    saveToLocalStorage("activeNumPRs", []);
    saveToLocalStorage("reposToggled", false);
  }

  // set step to new decremented value
  saveToLocalStorage("step", newStep);
  //setStepState(newStep);
  console.log("this is the newStep on going back", newStep);
};

const handleStepForward = async (props: HandleStepForwardProps) => {
  const {
    /*  setStepState,
     setActiveNumPRs,
     setPAT, */
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
    saveToLocalStorage("patCode", initialValuePAT);
    //setPAT(initialValuePAT);
  }

  if (newStep === 4 || newStep === 3) {
    if (activeNumPRs.length !== 0) {
      console.log("activeNumPRs array is not empty");

      const currentSliderValue = (await loadFromLocalStorage(
        "pollingRate"
      )) as number;
      const patCode = (await loadFromLocalStorage("patCode")) as string;

      startPolling({ currentSliderValue, activeNumPRs, repoOwner, patCode });
      console.log("initial polling complete");
    } else {
      console.log("activeNumPRs array is empty");
    }
  }

  // set step to new incremented value
  saveToLocalStorage("step", newStep);
  //setStepState(newStep);

  console.log("this is the newStep on going forward", newStep);
};

const handleStepChange = async (props: HandleStepChangeProps) => {
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
    goalStep: props?.goalStep,
    initialValuePAT: props.initialValuePAT,
  };

  switch (stepOperation) {
    case "stepBack":
      await handleStepBack(backButtonOperationProps);
      break;
    case "stepForward":
      await handleStepForward(nextButtonOperationsProps);
      break;
    default:
      break;
  }
};

export { handleStepChange };
