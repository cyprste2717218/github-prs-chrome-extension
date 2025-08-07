import type { StepComponentProps } from "@/models/StepComponentModels";

import "../App.css";
import ChooseSetupOptComponent from "./ChooseSetupOptComponent.tsx";
import GitDetailsEntryComponent from "./GitDetailsEntryComponent.tsx";
import ChooseReposComponent from "./ChooseReposComponent.tsx";
import DisplayTrackedReposComponent from "./DisplayTrackedReposComponent.tsx";
import SettingsComponent from "./SettingsComponent.tsx";

const StepComponent = ({
  setUsername,
  setRepoDetails,
  setActiveNumPRs,
  setPAT,
  setStep,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  setActiveResultsPage,
  username,
  repoDetails,
  currentStep,
  activeNumPRs,
  patCode,
  numPageResults,
  allReposToggled,
  activeResultsPage,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (currentStep) {
    case 1:
      CurrentStepUI = (
        <ChooseSetupOptComponent
          setStep={setStep}
          setPAT={setPAT}
          setActiveNumPRs={setActiveNumPRs}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          setReposToggled={setReposToggled}
          currentStep={currentStep}
          username={username}
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
          setPAT={setPAT}
          setActiveNumPRs={setActiveNumPRs}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          setReposToggled={setReposToggled}
          activeNumPRs={activeNumPRs}
          username={username}
          repoDetails={repoDetails}
          currentStep={currentStep}
          patCode={patCode}
        />
      );
      break;

    case 3:
      CurrentStepUI = (
        <ChooseReposComponent
          setActiveNumPRs={setActiveNumPRs}
          setNumPageResults={setNumPageResults}
          setRepoDetails={setRepoDetails}
          setActiveResultsPage={setActiveResultsPage}
          setReposToggled={setReposToggled}
          username={username}
          patCode={patCode}
          numPageResults={numPageResults}
          activeNumPRs={activeNumPRs}
          repoDetails={repoDetails}
          currentStep={currentStep}
          allReposToggled={allReposToggled}
          activeResultsPage={activeResultsPage}
        />
      );
      break;

    case 4:
      CurrentStepUI = (
        <DisplayTrackedReposComponent
          username={username}
          activeNumPRs={activeNumPRs}
        />
      );
      break;

    case 5:
      CurrentStepUI = <SettingsComponent />;
  }

  return CurrentStepUI;
};

export default StepComponent;
