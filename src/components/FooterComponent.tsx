import { ActiveNumPRs } from "../models/RepoCardModels";
import { updatePRDetails } from "../utilities/repoDetailUtilities";
import RefreshButton from "./RefreshButton";

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

    setStepState(currentStep + 1);
  }

  return (
    <>
      {currentStep === 2 && <button onClick={() => handleClick()}>Next</button>}
	  {currentStep === 3 && <RefreshButton handleRefresh={() => handleClick()} />}
    </>
  );
};

export default FooterComponent;
