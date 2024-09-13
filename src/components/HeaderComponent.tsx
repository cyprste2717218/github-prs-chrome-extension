import ButtonCustom from "./ButtonCustom";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";
import { updatePRDetails } from "@/utilities/repoDetailUtilities";
import { ActiveNumPRs } from "@/models/RepoCardModels";
import "../App.css";

type HeaderProps = {
  currentStep: number;
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

const TitleComponent = ({
  currentStep,
}: {
  currentStep: number;
}): JSX.Element => {
  let stepTitle = "";

  switch (currentStep) {
    case 1:
      stepTitle = "Enter Your Github Username";
      break;
    case 2:
      stepTitle = "Choose Repositories";
      break;
    case 3:
      stepTitle = "Your Repositories";
      break;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <h2 className="title" style={{ textAlign: "left" }}>
          {stepTitle}
        </h2>
      </div>
    </div>
  );
};

const HeaderComponent = ({
  setStepState,
  setRepoDetails,
  setActiveNumPRs,
  currentStep,
  activeNumPRs,
  repoOwner,
}: HeaderProps): JSX.Element => {
  type HandleStepChangeProps = {
    currentStep: number;
    setRepoDetails: React.Dispatch<
      React.SetStateAction<RepoCardComponentDetails[] | null>
    >;
  };

  const handleStepChange = ({ currentStep }: HandleStepChangeProps) => {
    setStepState(currentStep - 1);
  };

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {(currentStep === 2 || currentStep === 3) && (
        <div style={{ marginRight: "60px" }}>
          <ButtonCustom
            type="back"
            setStep={() => handleStepChange({ currentStep, setRepoDetails })}
            currentStep={currentStep}
          />
        </div>
      )}
      <div style={{ marginTop: "auto", marginBottom: "auto" }}>
        <TitleComponent currentStep={currentStep} />
      </div>
      {currentStep === 2 && (
        <div style={{ marginLeft: "60px" }}>
          <ButtonCustom type="next" onClick={handleClick} />
        </div>
      )}
    </div>
  );
};

export default HeaderComponent;
