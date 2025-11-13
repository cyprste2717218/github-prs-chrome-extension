import { useCallback, useEffect, useState } from "react";
import HeaderComponent from "./components/header/HeaderComponent.tsx";
import StepComponent from "./components/StepComponent";
import WarningModal from "./components/input/WarningModal.tsx";
import { Toaster } from "@/components/ui/sonner";
// import { useChromeStorageSync } from "@/utilities/hooks/useChromeStorageSync.ts";
import { useChromeStorageListener } from "./utilities/hooks/useChromeStorageListener.ts";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/frontend/RepoCardModels.ts";
import "./App.css";

function App() {


  const loadInitialData = useCallback(async () => {
    const getSetData = async (): Promise<[key: string] | null> => {
      const result = chrome.storage.local.get(keysToLoad, (result) => {
        // Check for chrome.runtime.lastError in case of an issue
        if (chrome.runtime.lastError) {
          console.error("Error loading storage:", chrome.runtime.lastError);
          return null;
        }

        console.log("Loaded initial data from storage:", result);

        // @ts-ignore
        setUsername(result.username); // @ts-ignore
        setRepoDetails(result.repoDetails); // @ts-ignore
        setActiveNumPRs(result.activeNumPRs); // @ts-ignore
        setStep(result.step); // @ts-ignore
        setPAT(result.patCode); // @ts-ignore
        setReposToggled(result.reposToggled);// @ts-ignore
        setNumPageResults(result.numPageResults);// @ts-ignore
        setActiveResultsPage(result.activeResultsPage);// @ts-ignore
        setPollingRate(result.pollingRate);

        return result;
      });

      if (result === void 0) {
        return null;
      }
      return result;
    }

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

    const result = await getSetData();

    if (result === null) {
      console.error("Failed to load initial data from storage.");
      return;
    }

  }, []);

  const [username, setUsername] = useState<string>("");
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
  useChromeStorageListener("username", (value) => setUsername(value as string));
  useChromeStorageListener("activeNumPRs", (value) => setActiveNumPRs(value as ActiveNumPRs[]));
  useChromeStorageListener("step", (value) => setStep(value as number));
  useChromeStorageListener("repoDetails", (value) => setRepoDetails(value as RepoCardComponentDetails[] | null));
  useChromeStorageListener("patCode", (value) => setPAT(value as string));
  useChromeStorageListener("numPageResults", (value) => setNumPageResults(value as number));
  useChromeStorageListener("reposToggled", (value) => setReposToggled(value as boolean));
  useChromeStorageListener("activeResultsPage", (value) => setActiveResultsPage(value as number));
  useChromeStorageListener("pollingRate", (value) => setPollingRate(value as number));

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /* useChromeStorageSync({
    username: username,
    step: step,
    repoDetails: repoDetails,
    activeNumPRs: activeNumPRs,
    patCode: PAT,
    numPageResults: numPageResults,
    reposToggled: reposToggled,
    activeResultsPage: activeResultsPage,
    pollingRate: pollingRate,
  }); */

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
