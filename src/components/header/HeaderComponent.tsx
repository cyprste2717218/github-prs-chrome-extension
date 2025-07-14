import { handleStepChange } from "@/utilities/setUpUtilities";
import ButtonCustom from "../input/ButtonCustom";
import "../../App.css";
import { HeaderProps } from "@/models/HeaderComponentModels.ts";
import SelectAllButton from "../input/SelectAllButton";
import TitleComponent from "./TitleComponent";

const HeaderComponent = ({
  setStepState,
  setActiveNumPRs,
  setPAT,
  setUsername,
  setRepoDetails,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  currentStep,
  activeNumPRs,
  repoOwner,
  hasPAT,
  allReposToggled,
  repoDetails,
}: HeaderProps): JSX.Element => {
  // To-do: make separate bundles for props for respective back and next button types
  const buttonStateBundle = {
    setStepState: setStepState,
    setPAT: setPAT,
    setActiveNumPRs: setActiveNumPRs,
    setUsername: setUsername,
    setRepoDetails: setRepoDetails,
    setNumPageResults: setNumPageResults,
    setDisplayWarning: setDisplayWarning,
    setReposToggled: setReposToggled,
    currentStep: currentStep,
    repoOwner: repoOwner,
    activeNumPRs: activeNumPRs,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          marginBottom: "20px",
        }}
      >
        {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
          <div
            style={{ marginRight: `${currentStep === 2 ? "20px" : "60px"}` }}
          >
            <ButtonCustom
              type="back"
              setStep={() =>
                handleStepChange({
                  ...buttonStateBundle,
                  stepOperation: "stepBack",
                  initialValuePAT: currentStep === 3 ? null : hasPAT,
                })
              }
              currentStep={currentStep}
            />
          </div>
        )}

        <div style={{ marginTop: "auto", marginBottom: "auto" }}>
          {currentStep === 1 && (
            <div style={{ marginBottom: "30px", fontSize: "20px" }}>
              <h1 className="title">Welcome to Github PR Tracker!</h1>
            </div>
          )}
          <TitleComponent hasPAT={hasPAT} currentStep={currentStep} />
        </div>
        {currentStep === 4 && (
          <div style={{ marginLeft: "60px" }}>
            <ButtonCustom
              type="refresh"
              setActiveNumPRs={setActiveNumPRs}
              setStep={setStepState}
              activeNumPRs={activeNumPRs}
              currentStep={currentStep}
              repoOwner={repoOwner}
            />
          </div>
        )}
        {currentStep === 3 && (
          <div style={{ marginLeft: "60px" }}>
            <ButtonCustom
              type="next"
              onClick={() =>
                handleStepChange({
                  ...buttonStateBundle,
                  stepOperation: "stepForward",
                  initialValuePAT: hasPAT,
                })
              }
              activeNumPRs={activeNumPRs}
            />
          </div>
        )}
      </div>
      {currentStep === 3 && (
        <SelectAllButton
          allReposToggled={allReposToggled}
          repoDetails={repoDetails}
          activeNumPRs={activeNumPRs}
          setReposToggled={setReposToggled}
          setActiveNumPRs={setActiveNumPRs}
          setRepoDetails={setRepoDetails}
        />
      )}
    </div>
  );
};

export default HeaderComponent;
