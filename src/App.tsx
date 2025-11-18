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
    const getSetData = async () => {
      chrome.storage.local.get(keysToLoad, (result) => {
        // Check for chrome.runtime.lastError in case of an issue
        if (chrome.runtime.lastError) {
          console.error("Error loading storage:", chrome.runtime.lastError);
          return null;
        }

        console.log("Loaded initial data from storage:", result);

        // Checking for empty or null string for username before parsing
        const jsonUsername = result.username;
        if (
          jsonUsername === null ||
          jsonUsername === undefined ||
          jsonUsername.trim() === ""
        ) {
          console.log(
            "username value retrieved is empty or null, setting empty string manually to avoid JSON parsing error"
          );
          setUsername("");
        } else {
          setUsername(result.username);
        }

        setRepoDetails(result.repoDetails);
        setActiveNumPRs(result.activeNumPRs);
        setStep(JSON.parse(result.step));
        setPAT(result.patCode);
        setReposToggled(JSON.parse(result.reposToggled));
        setNumPageResults(JSON.parse(result.numPageResults));
        setActiveResultsPage(JSON.parse(result.activeResultsPage));
        setPollingRate(JSON.parse(result.pollingRate));

        return result;
      });
    };

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

  // Listen for storage changes and update state accordingly
  const storageListenersConfig = [
    { key: "username", setState: setUsername },
    { key: "activeNumPRs", setState: setActiveNumPRs },
    { key: "step", setState: setStep },
    { key: "repoDetails", setState: setRepoDetails },
    { key: "patCode", setState: setPAT },
    { key: "numPageResults", setState: setNumPageResults },
    { key: "reposToggled", setState: setReposToggled },
    { key: "activeResultsPage", setState: setActiveResultsPage },
    { key: "pollingRate", setState: setPollingRate },
  ];
  storageListenersConfig.forEach(({ key, setState }) => {
    useChromeStorageListener(key, (value) => setState(value as any));
  });

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
