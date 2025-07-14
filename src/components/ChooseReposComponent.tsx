import AllPreviewRepoCards from "./repo-cards/AllPreviewRepoCards";
import PaginationInput from "./input/PaginationInput";
import { ChooseReposComponentProps } from "@/models/StepComponentModels";

const ChooseReposComponent = ({
  repoDetails,
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
  activeNumPRs,
  currentStep,
  numPageResults,
  username,
  patCode,
  allReposToggled,
}: ChooseReposComponentProps) => {
  return (
    <>
      <AllPreviewRepoCards
        setActiveNumPRs={setActiveNumPRs}
        setNumPageResults={setNumPageResults}
        activeNumPRs={activeNumPRs}
        repoDetails={repoDetails}
        step={currentStep}
        numPageResults={numPageResults}
        setRepoDetails={setRepoDetails}
        username={username}
        patCode={patCode}
        allReposToggled={allReposToggled}
      />
      <PaginationInput
        setNumPageResults={setNumPageResults}
        numPageResults={numPageResults}
        setRepoDetails={setRepoDetails}
        username={username}
        patCode={patCode}
      />
    </>
  );
};

export default ChooseReposComponent;
