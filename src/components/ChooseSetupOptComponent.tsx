import ButtonCustom from "./input/ButtonCustom";
import { handleStepChange } from "@/utilities/setUpUtilities";
import { Separator } from "./ui/separator";
import { ChooseSetupOptProps } from "@/models/StepComponentModels";

const ChooseSetupOptComponent = ({
  setHasPAT,
  setStep,
  setActiveNumPRs,
  setUsername,
  setRepoDetails,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  currentStep,
  repoOwner,
  activeNumPRs,
}: ChooseSetupOptProps) => {
  const buttonStateBundle = {
    setStepState: setStep,
    setPAT: setHasPAT,
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
    <>
      <div>
        <div
          style={{ marginBottom: "10px" }}
          onClick={() =>
            handleStepChange({
              ...buttonStateBundle,
              stepOperation: "stepForward",
              initialValuePAT: null,
            })
          }
        >
          <ButtonCustom type="username" />
        </div>
        <Separator className="my-4" />

        <div
          onClick={() =>
            handleStepChange({
              ...buttonStateBundle,
              stepOperation: "stepForward",
              initialValuePAT: "",
            })
          }
        >
          <ButtonCustom type="usernameWithPAT" />
        </div>
        <div className="mt-4 text-center text-sm">
          <a
            href="https://github.com/cyprste2717218/github-prs-chrome-extension/tree/dev#authenticated-approach"
            target="_blank"
          >
            Follow the readme here
          </a>{" "}
          to create a PAT (classic)
        </div>
      </div>
    </>
  );
};

export default ChooseSetupOptComponent;
