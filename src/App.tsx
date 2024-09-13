import { useEffect, useState } from "react";
import HeaderComponent from "./components/HeaderComponent";
import StepComponent from "./components/StepComponent";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/RepoCardModels";
import "./App.css";

import {
  saveLocalCurrentStep,
  //setChromeExtensionWindowSize,
  getLocalCurrentStep, // @ts-ignore
} from "../public/background.js";

function App() {
  const [username, setUsername] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [repoDetails, setRepoDetails] = useState<
    RepoCardComponentDetails[] | null
  >(null);
  const [activeNumPRs, setActiveNumPRs] = useState<ActiveNumPRs[]>([]);

  useEffect(() => {
    const setInitialStep = async () => {
      try {
        const response = await getLocalCurrentStep();
        const initialStep = await response;
        //setStep(initialStep);
        console.log("Initial step set to:", initialStep);
      } catch (error) {
        console.error("Error setting initial step:", error);
      }
    };

    setInitialStep();
    saveLocalCurrentStep(step);
    //setChromeExtensionWindowSize()
    console.log("localCurrentStep:", getLocalCurrentStep());
  }, [activeNumPRs]);

  return (
    <>
      <HeaderComponent
        setStepState={setStep}
        setRepoDetails={setRepoDetails}
        setActiveNumPRs={setActiveNumPRs}
        activeNumPRs={activeNumPRs}
        currentStep={step}
        repoOwner={username}
      />

      <StepComponent
        setUsername={setUsername}
        setRepoDetails={setRepoDetails}
        setStep={setStep}
        setActiveNumPRs={setActiveNumPRs}
        username={username}
        repoDetails={repoDetails}
        step={step}
        activeNumPRs={activeNumPRs}
      />
    </>
  );
}

export default App;
