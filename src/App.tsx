import { useEffect, useState } from "react";
import HeaderComponent from "./components/HeaderComponent";
import StepComponent from "./components/StepComponent";
import FooterComponent from "./components/FooterComponent";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/RepoCardModels";
import "./App.css";
import { updatePRDetails } from "./utilities/repoDetailUtilities";
// @ts-ignore
import {
  saveLocalRepoDetails,
  getLocalRepoDetails,
  saveLocalCurrentStep,
  getLocalCurrentStep,
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

    console.log("localCurrentStep:", getLocalCurrentStep());

    if (activeNumPRs.length > 0 && step === 3) {
      const repoOwner = username;

      const interval = setInterval(async () => {
        const response = await updatePRDetails({
          setActiveNumPRs,
          activeNumPRs,
          repoOwner,
        });
        console.log(response);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeNumPRs]);

  return (
    <>
      <HeaderComponent setStepState={setStep} currentStep={step} />

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

      <FooterComponent
        setStepState={setStep}
        currentStep={step}
        setActiveNumPRs={setActiveNumPRs}
        activeNumPRs={activeNumPRs}
        repoOwner={username}
      />
    </>
  );
}

export default App;
