import { useEffect, useState } from "react";
import HeaderComponent from "./components/HeaderComponent";
import StepComponent from "./components/StepComponent";
import WarningModal from "./components/WarningModal";
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
  const [PAT, setPAT] = useState<string | null>(null);
  const [numPageResults, setNumPageResults] = useState<number | null>(null);
  const [displayWarning, setDisplayWarning] = useState<boolean>(false);
  const [reposToggled, setReposToggled] = useState<boolean>(false);

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

    // @ts-ignore
    chrome.storage.local.get("patCode", (result) => {
      setPAT(JSON.parse(result.patCode));
      console.log("PAT:", result.patCode);
    });

    // @ts-ignore
    chrome.storage.local.get("reposToggled", (result) => {
      setReposToggled(JSON.parse(result.reposToggled));
    });

    // @ts-ignore
    chrome.storage.local.get("numPageResults", (result) => {
      setNumPageResults(JSON.parse(result.numPageResults));
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
        setUsername={setUsername}
        setNumPageResults={setNumPageResults}
        setPAT={setPAT}
        setDisplayWarning={setDisplayWarning}
        activeNumPRs={activeNumPRs}
        currentStep={step}
        repoOwner={username}
        hasPAT={PAT}
        repoDetails={repoDetails}
        allReposToggled={reposToggled}
        setReposToggled={setReposToggled}
      />

      <StepComponent
        setUsername={setUsername}
        setRepoDetails={setRepoDetails}
        setStep={setStep}
        setActiveNumPRs={setActiveNumPRs}
        setHasPAT={setPAT}
        setNumPageResults={setNumPageResults}
        setDisplayWarning={setDisplayWarning}
        username={username}
        repoDetails={repoDetails}
        step={step}
        activeNumPRs={activeNumPRs}
        hasPAT={PAT}
        repoOwner={username}
        numPageResults={numPageResults}
      />

      {displayWarning && <WarningModal setDisplayWarning={setDisplayWarning} />}
    </>
  );
}

export default App;
