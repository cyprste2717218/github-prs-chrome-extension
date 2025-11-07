import { useCallback, useEffect, useState } from "react";
import HeaderComponent from "./components/header/HeaderComponent.tsx";
import StepComponent from "./components/StepComponent";
import WarningModal from "./components/input/WarningModal.tsx";
import { Toaster } from "@/components/ui/sonner";
import { useChromeStorageSync } from "@/utilities/hooks/useChromeStorageSync.ts";
import { useChromeStorageListener } from "./utilities/hooks/useChromeStorageListener.ts";

import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/frontend/RepoCardModels.ts";
import "./App.css";

function App() {
  const loadInitialData = useCallback(() => {
    const keysToLoad = [
      "username",
      "repoDetails",
      "activeNumPRs",
      "step",
      "patCode",
      "reposToggled",
      "numPageResults",
      "activeResultsPage",
      "pollingRate",
    ];

    chrome.storage.local.get(keysToLoad, (result) => {
      // Check for chrome.runtime.lastError in case of an issue
      if (chrome.runtime.lastError) {
        console.error("Error loading storage:", chrome.runtime.lastError);
        return;
      }

      setUsername(result.username || "");
      setRepoDetails(result.repoDetails || null);
      setActiveNumPRs(result.activeNumPRs || []);
      setStep(result.step || 1);
      setPAT(result.patCode || null);
      setReposToggled(result.reposToggled || false);
      setNumPageResults(result.numPageResults || 0);
      setActiveResultsPage(result.activeResultsPage || 1);
      setPollingRate(result.pollingRate || 50);
    });
  }, []);

  const [username, setUsername] = useState<string>(""); // @ts-ignore
  const [step, setStep] = useState<number>(1);
  const [repoDetails, setRepoDetails] = useState<
    RepoCardComponentDetails[] | null
  >(null);
  const [activeNumPRs, setActiveNumPRs] = useState<ActiveNumPRs[]>([]);
  const [PAT, setPAT] = useState<string | null>(null);
  const [numPageResults, setNumPageResults] = useState<number>(0);
  const [displayWarning, setDisplayWarning] = useState<boolean>(false);
  const [reposToggled, setReposToggled] = useState<boolean>(false);
  const [activeResultsPage, setActiveResultsPage] = useState<number>(1);
  const [pollingRate, setPollingRate] = useState<number>(50); //To-do: set pollingRate values to minute equivalents

  // Listen for storage changes and update state
  useChromeStorageListener("username", setUsername);
  useChromeStorageListener("activeNumPRs", setActiveNumPRs);
  useChromeStorageListener("step", setStep);
  useChromeStorageListener("repoDetails", setRepoDetails);
  useChromeStorageListener("patCode", setPAT);
  useChromeStorageListener("numPageResults", setNumPageResults);
  useChromeStorageListener("reposToggled", setReposToggled);
  useChromeStorageListener("activeResultsPage", setActiveResultsPage);
  useChromeStorageListener("pollingRate", setPollingRate);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useChromeStorageSync({
    username: username,
    step: step,
    repoDetails: repoDetails,
    activeNumPRs: activeNumPRs,
    patCode: PAT,
    numPageResults: numPageResults,
    reposToggled: reposToggled,
    activeResultsPage: activeResultsPage,
    pollingRate: pollingRate,
  });

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
        setPAT={setPAT}
        setNumPageResults={setNumPageResults}
        setDisplayWarning={setDisplayWarning}
        setReposToggled={setReposToggled}
        setActiveResultsPage={setActiveResultsPage}
        username={username}
        repoDetails={repoDetails}
        currentStep={step}
        activeNumPRs={activeNumPRs}
        patCode={PAT}
        numPageResults={numPageResults}
        allReposToggled={reposToggled}
        activeResultsPage={activeResultsPage}
        setPollingRate={setPollingRate}
        pollingRate={pollingRate}
      />

      {displayWarning && <WarningModal setDisplayWarning={setDisplayWarning} />}

      <Toaster position="top-center" expand={false} richColors closeButton />
    </>
  );
}

export default App;
