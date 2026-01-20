import AllPreviewRepoCards from "./repo-cards/AllPreviewRepoCards";
import PaginationInput from "./input/PaginationInput";
import ButtonCustom from "./input/ButtonCustom";
import SelectAllButton from "./input/SelectAllButton";
import { ChooseReposComponentProps } from "@/models/frontend/StepComponentModels";

const ChooseReposComponent = ({
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
  setReposToggled,
  setActiveResultsPage,
  repoDetails,
  activeNumPRs,
  currentStep,
  numPageResults,
  username,
  patCode,
  allReposToggled,
  activeResultsPage,
}: ChooseReposComponentProps) => {
  // Threshold for the scroll to top button to appear
  const thresholdPixels = -128;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <SelectAllButton
        allReposToggled={allReposToggled}
        setRepoDetails={setRepoDetails}
        setActiveNumPRs={setActiveNumPRs}
        repoDetails={repoDetails}
        activeNumPRs={activeNumPRs}
        setReposToggled={setReposToggled}
      />
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
      <div style={{ marginLeft: "auto", marginRight: "auto" }}>
        <PaginationInput
          setNumPageResults={setNumPageResults}
          setActiveResultsPage={setActiveResultsPage}
          setRepoDetails={setRepoDetails}
          numPageResults={numPageResults}
          username={username}
          patCode={patCode}
          activeResultsPage={activeResultsPage}
        />
      </div>
      <div className="fixed bottom-4 right-0 z-10">
        <ButtonCustom
          type="scrollToTop"
          scrollThresholdPixels={thresholdPixels}
        />
      </div>
    </div>
  );
};

export default ChooseReposComponent;
