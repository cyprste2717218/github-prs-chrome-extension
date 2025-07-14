import type { StepComponentProps } from "@/models/StepComponentModels";

import "../App.css";
import ChooseSetupOptComponent from "./ChooseSetupOptComponent.tsx";
import GitDetailsEntryComponent from "./GitDetailsEntryComponent.tsx";
import ChooseReposComponent from "./ChooseReposComponent.tsx";
import DisplayTrackedReposComponent from "./DisplayTrackedReposComponent.tsx";

const StepComponent = ({
  setUsername,
  setRepoDetails,
  setActiveNumPRs,
  setHasPAT,
  setStep,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  username,
  repoDetails,
  step,
  activeNumPRs,
  hasPAT,
  repoOwner,
  numPageResults,
  reposToggled,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = (
        <ChooseSetupOptComponent
          setStep={setStep}
          setHasPAT={setHasPAT}
          setActiveNumPRs={setActiveNumPRs}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          setReposToggled={setReposToggled}
          currentStep={step}
          repoOwner={repoOwner}
          activeNumPRs={activeNumPRs}
        />
      );
      break;

    case 2:
      CurrentStepUI = (
        <GitDetailsEntryComponent
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
          setPAT={setHasPAT}
          setActiveNumPRs={setActiveNumPRs}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          setReposToggled={setReposToggled}
          activeNumPRs={activeNumPRs}
          username={username}
          repoDetails={repoDetails}
          currentStep={step}
          PAT={hasPAT}
        />
      );
      break;

    case 3:
      CurrentStepUI = (
        <ChooseReposComponent
          setActiveNumPRs={setActiveNumPRs}
          setNumPageResults={setNumPageResults}
          setRepoDetails={setRepoDetails}
          username={username}
          patCode={hasPAT}
          numPageResults={numPageResults}
          activeNumPRs={activeNumPRs}
          repoDetails={repoDetails}
          step={step}
          reposToggled={reposToggled}
        />
      );
      break;

    case 4:
      CurrentStepUI = (
        <DisplayTrackedReposComponent
          githubUsername={username}
          activeNumPRs={activeNumPRs}
        />
      );
  }

  return CurrentStepUI;
};

export default StepComponent;
