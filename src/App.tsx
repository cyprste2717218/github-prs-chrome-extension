import { useEffect, useState } from "react";
import HeaderComponent from "./components/header/HeaderComponent.tsx";
import StepComponent from "./components/StepComponent";
import WarningModal from "./components/input/WarningModal.tsx";
import { Toaster } from "@/components/ui/sonner";
import { loadFromLocalStorage } from "./utilities/service-worker-funcs/storage-utils.js";

import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "./models/frontend/RepoCardModels.ts";
import "./App.css";

function App() {
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

  useEffect(() => {

    loadFromLocalStorage("username").then((result) => {
      setUsername(result ? (result as string) : "");
    });

    loadFromLocalStorage("repoDetails").then((result) => {
      setRepoDetails(result ? (result as RepoCardComponentDetails[]) : null);
    });

    loadFromLocalStorage("activeNumPRs").then((result) => {
      setActiveNumPRs(result ? (result as ActiveNumPRs[]) : []);
    });

    loadFromLocalStorage("step").then((result) => {
      setStep(result ? (result as number) : 1);
    });

    loadFromLocalStorage("patCode").then((result) => {
      setPAT(result ? (result as string) : null);
    });

    loadFromLocalStorage("reposToggled").then((result) => {
      setReposToggled(result ? (result as boolean) : false);
    });

    loadFromLocalStorage("numPageResults").then((result) => {
      setNumPageResults(result ? (result as number) : 0);
    });

    loadFromLocalStorage("activeResultsPage").then((result) => {
      setActiveResultsPage(result ? (result as number) : 1);
    });

    loadFromLocalStorage("pollingRate").then((result) => {
      setPollingRate(result ? (result as number) : 50);
    });

    loadFromLocalStorage("step").then((result) => {
      setStep(result ? (result as number) : 1);
    });

    console.log("localCurrentStep:", step);
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
