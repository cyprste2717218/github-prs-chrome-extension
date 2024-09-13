import { ActiveNumPRs } from "../models/RepoCardModels";
import { updatePRDetails } from "../utilities/repoDetailUtilities";
import ButtonCustom from "./ButtonCustom";

type FooterComponentProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

const FooterComponent = ({
  setStepState,
  setActiveNumPRs,
  currentStep,
  activeNumPRs,
  repoOwner,
}: FooterComponentProps): JSX.Element => {
  async function handleClick() {
    if (activeNumPRs.length !== 0) {
      console.log("activeNumPRs array is not empty");
      updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
    } else {
      console.log("activeNumPRs array is empty");
    }

    if (currentStep === 2) {
      setStepState(currentStep + 1);
    }
  }

  return (
    <>
      {currentStep === 2 && <button onClick={() => handleClick()}>Next</button>}
      {currentStep === 3 && (
        <ButtonCustom
          type="refresh"
          setActiveNumPRs={setActiveNumPRs}
          setStep={setStepState}
          activeNumPRs={activeNumPRs}
          currentStep={currentStep}
          repoOwner={repoOwner}
        />
      )}
    </>
  );
};

export default FooterComponent;
