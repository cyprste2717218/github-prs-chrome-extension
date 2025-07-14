import AllPreviewRepoCards from "./repo-cards/AllPreviewRepoCards";
import PaginationInput from "./input/PaginationInput";
import { ChooseReposComponentProps } from "@/models/StepComponentModels";

const ChooseReposComponent = ({
  repoDetails,
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
  activeNumPRs,
  step,
  numPageResults,
  username,
  patCode,
  reposToggled,
}: ChooseReposComponentProps) => {
  return (
    <>
      <AllPreviewRepoCards
        setActiveNumPRs={setActiveNumPRs}
        setNumPageResults={setNumPageResults}
        activeNumPRs={activeNumPRs}
        repoDetails={repoDetails}
        step={step}
        numPageResults={numPageResults}
        setRepoDetails={setRepoDetails}
        username={username}
        patCode={patCode}
        reposToggled={reposToggled}
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
