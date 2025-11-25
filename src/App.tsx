import { useEffect, useState, useCallback } from "react";
import HeaderComponent from "./components/header/HeaderComponent.tsx";
import StepComponent from "./components/StepComponent";
import WarningModal from "./components/input/WarningModal.tsx";
import { Toaster } from "@/components/ui/sonner";
import { useChromeStorageListener } from "./utilities/hooks/useChromeStorageListener.ts";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/frontend/RepoCardModels.ts";
import "./App.css";
import { loadAllFromLocalStorage } from "./utilities/service-worker-funcs/storage-utils.ts";

function App() {
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const intialConfig = [
    { key: "username", setState: setUsername },
    { key: "activeNumPRs", setState: setActiveNumPRs },
    { key: "step", setState: setStep },
    { key: "repoDetails", setState: setRepoDetails },
    { key: "patCode", setState: setPAT },
    { key: "numPageResults", setState: setNumPageResults },
    { key: "reposToggled", setState: setReposToggled },
    { key: "activeResultsPage", setState: setActiveResultsPage },
    { key: "pollingRate", setState: setPollingRate },
    { key: "isRefreshing", setState: setIsRefreshing },
  ];

  // Configure storage listeners for updating state accordingly
  intialConfig.forEach(({ key, setState }) => {
    useChromeStorageListener(key, (value) => setState(value as any));
  });

  // Load initial data from storage on component mount
  const loadInitialData = useCallback(async () => {
    const getSetData = async () => {
      const result = await loadAllFromLocalStorage<{
        [key: string]: any;
      }>(keysToLoad);

      if (result === null || undefined || Object.keys(result).length === 0) {
        throw new Error("Failed to load initial data from storage.");
      }

      // Set state for each retrieved key-value pair
      intialConfig.forEach(({ key, setState }) => {
        if (result[key] !== undefined) {
          console.log(
            `Setting state for key: ${key}, value: `,
            result[key],
            typeof result[key]
          );
          setState(result[key]);
        }
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
        isRefreshing={isRefreshing}
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
