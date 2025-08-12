import { handleStepChange } from "@/utilities/setUpUtilities";
import ButtonCustom from "../input/ButtonCustom";
import "../../App.css";
import { HeaderProps } from "@/models/HeaderComponentModels.ts";
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

  const BackButton = () => {
    return (
      (currentStep === 2 ||
        currentStep === 3 ||
        currentStep === 4 ||
        currentStep === 5) && (
        <div style={{ marginRight: `${currentStep === 2 ? "20px" : "60px"}` }}>
          <ButtonCustom
            type="back"
            onClick={() =>
              handleStepChange({
                ...buttonStateBundle,
                goalStep: currentStep === 5 ? 1 : undefined,
                stepOperation: "stepBack",
                initialValuePAT: currentStep === 3 ? null : hasPAT,
              })
            }

          />
        </div>
      )
    );
  };

  const NextButton = () => {
    return (
      currentStep === 3 && (
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
      )
    );
  };

  const RefreshButton = () => {
    return (
      currentStep === 4 && (
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
      )
    );
  };

  const IntroSpecificContent = () => {
    return (
      currentStep === 1 && (
        <div className="">
          <div className="absolute top-8 right-8 z-10">
            <ButtonCustom
              type="settings"
              onClick={() =>
                handleStepChange({
                  ...buttonStateBundle,
                  goalStep: 5,
                  stepOperation: "stepForward",
                  initialValuePAT: hasPAT,
                })
              } />
          </div>
          <div style={{ marginBottom: "30px", fontSize: "20px" }}>
            <h1 className="title">Welcome to Github PR Tracker!</h1>
          </div>
        </div>
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        marginBottom: "20px",
      }}
    >
      <div style={{ marginTop: "auto", marginBottom: "auto" }}>
        <IntroSpecificContent />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <BackButton />
          <TitleComponent hasPAT={hasPAT} currentStep={currentStep} />
          <NextButton />
          <RefreshButton />
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
