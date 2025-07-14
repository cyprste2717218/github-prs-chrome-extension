import { handleStepChange } from "@/utilities/setUpUtilities";
import { handleToggleAllRepos } from "@/utilities/repoDetailUtilities";
import ButtonCustom from "./ButtonCustom";
import CheckBoxCustom from "./CheckBoxCustom";
import "../App.css";
import {
  HeaderProps,
  TitleProps,
  SelectAllButtonProps,
} from "@/models/HeaderComponentModels.ts";

const TitleComponent = ({ currentStep, hasPAT }: TitleProps): JSX.Element => {
  let stepTitle = "";

  switch (currentStep) {
    case 1:
      stepTitle = "Choose a Setup Option from Below";
      break;
    case 2:
      if (hasPAT !== null) {
        stepTitle = "Enter Your PAT and the Github Username/Org Name to Track";
      } else {
        stepTitle = "Enter the Github Username/Org Name to Track";
      }
      break;
    case 3:
      stepTitle = "Choose Repositories";
      break;
    case 4:
      stepTitle = "Your Repositories";
      break;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <h2 className="steptitle" style={{ textAlign: "left" }}>
          {stepTitle}
        </h2>
      </div>
    </div>
  );
};

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

const SelectAllButton = ({
  allReposToggled,
  repoDetails,
  activeNumPRs,
  setActiveNumPRs,
  setRepoDetails,
  setReposToggled,
}: SelectAllButtonProps): JSX.Element => {
  async function toggleAllSelectedRepos() {
    if (repoDetails !== null) {
      setReposToggled(!allReposToggled);
      await handleToggleAllRepos({
        allReposToggled,
        setRepoDetails,
        setActiveNumPRs,
        activeNumPRs,
        repoDetails,
      });
    }
  }
  console.log(
    "Select all button will receive repoChecked value: ",
    allReposToggled
  );

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <p>Select All</p>
      <CheckBoxCustom
        handleClick={toggleAllSelectedRepos}
        repoChecked={allReposToggled}
        name={"-ToggleAll"}
      />
    </div>
  );
};

export default HeaderComponent;
