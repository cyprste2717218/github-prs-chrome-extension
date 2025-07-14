import ButtonCustom from "./input/ButtonCustom";
import { handleStepChange } from "@/utilities/setUpUtilities";
import { Separator } from "./ui/separator";
import { ChooseSetupOptProps } from "@/models/StepComponentModels";

const ChooseSetupOptComponent = ({
  setPAT,
  setStep,
  setActiveNumPRs,
  setUsername,
  setRepoDetails,
  setNumPageResults,
  setDisplayWarning,
  setReposToggled,
  currentStep,
  username,
  activeNumPRs,
}: ChooseSetupOptProps) => {
  const buttonStateBundle = {
    setStepState: setStep,
    setPAT: setPAT,
    setActiveNumPRs: setActiveNumPRs,
    setUsername: setUsername,
    setRepoDetails: setRepoDetails,
    setNumPageResults: setNumPageResults,
    setDisplayWarning: setDisplayWarning,
    setReposToggled: setReposToggled,
    currentStep: currentStep,
    repoOwner: username,
    activeNumPRs: activeNumPRs,
  };

  const UsernameComponent = () => {
    return (
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
    );
  };

  const UsernameWithPATComponent = () => {
    return (
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
    );
  };

  const FollowReadMeComponent = () => {
    return (
      <div className="mt-4 text-center text-sm">
        <a
          href="https://github.com/cyprste2717218/github-prs-chrome-extension/tree/dev#authenticated-approach"
          target="_blank"
        >
          Follow the readme here
        </a>{" "}
        to create a PAT (classic)
      </div>
    );
  };

  return (
    <>
      <UsernameComponent />
      <Separator className="my-4" />
      <UsernameWithPATComponent />
      <FollowReadMeComponent />
    </>
  );
};

export default ChooseSetupOptComponent;
