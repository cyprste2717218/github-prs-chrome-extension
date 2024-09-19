import { useEffect, useState } from "react";
import HeaderComponent from "./components/HeaderComponent";
import StepComponent from "./components/StepComponent";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/RepoCardModels";
import "./App.css";

import {
  loadFromStorage,
  //setChromeExtensionWindowSize,
  // @ts-ignore
} from "../public/background.ts";

function App() {
  const [username, setUsername] = useState<string>(""); // @ts-ignore
  const [step, setStep] = useState<number>(1);
  const [repoDetails, setRepoDetails] = useState<
    RepoCardComponentDetails[] | null
  >(null);
  const [activeNumPRs, setActiveNumPRs] = useState<ActiveNumPRs[]>([]);
  const [hasPAT, setHasPAT] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore
    chrome.storage.local.get("username", (result) => {
      setUsername(JSON.parse(result.username));
    });

    // @ts-ignore
    chrome.storage.local.get("repoDetails", (result) => {
      setRepoDetails(JSON.parse(result.repoDetails));
    });

    // @ts-ignore
    chrome.storage.local.get("activeNumPRs", (result) => {
      setActiveNumPRs(JSON.parse(result.activeNumPRs));
    });

    // @ts-ignore
    chrome.storage.local.get("step", (result) => {
      setStep(JSON.parse(result.step));
    });

    //setChromeExtensionWindowSize()
    console.log("localCurrentStep:", loadFromStorage("step"));
  }, []);

  return (
    <>
      <HeaderComponent
        setStepState={setStep}
        setRepoDetails={setRepoDetails}
        setActiveNumPRs={setActiveNumPRs}
        activeNumPRs={activeNumPRs}
        currentStep={step}
        repoOwner={username}
        hasPAT={hasPAT}
        setHasPAT={setHasPAT}
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
