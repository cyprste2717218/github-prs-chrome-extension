import { ActiveNumPRs } from "../models/RepoCardModels";
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
  return (
    <>
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
