import AllPreviewRepoCards from "./repo-cards/AllPreviewRepoCards";
import PaginationInput from "./input/PaginationInput";
import ButtonCustom from "./input/ButtonCustom";
import { ChooseReposComponentProps } from "@/models/StepComponentModels";

const ChooseReposComponent = ({
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
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
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
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
      <div>
        <ButtonCustom
          type="scrollToTop"
          hookStyle={{ transition: "all 200ms ease-in" }}
        />
      </div>
    </div>
  );
};

export default ChooseReposComponent;
