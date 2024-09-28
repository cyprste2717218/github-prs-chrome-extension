import ButtonCustom from "./ButtonCustom";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";
import { updatePRDetails } from "@/utilities/repoDetailUtilities";
import { ActiveNumPRs } from "@/models/RepoCardModels";
import "../App.css";
import { saveToStorage } from "../../public/background.ts";

type HeaderProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentStep: number;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  hasPAT: string | undefined;
};

// To-do: move this props into own ts alias
const TitleComponent = ({
  currentStep,
  hasPAT,
}: {
  currentStep: number;
  hasPAT: string | undefined;
}): JSX.Element => {
  let stepTitle = "";

  switch (currentStep) {
    case 1:
      stepTitle = "Choose a Setup Option from Below";
      break;
    case 2:
      if (hasPAT !== null) {
        stepTitle = "Enter Your Github PAT and Username";
      } else {
        stepTitle = "Enter Your Github Username";
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
  setRepoDetails,
  setActiveNumPRs,
  setPAT,
  currentStep,
  activeNumPRs,
  repoOwner,
  hasPAT,
}: HeaderProps): JSX.Element => {
  type HandleStepChangeProps = {
    currentStep: number;
    setRepoDetails: React.Dispatch<
      React.SetStateAction<RepoCardComponentDetails[] | null>
    >;
  };

  const handleStepChange = ({ currentStep }: HandleStepChangeProps) => {
    setStepState(currentStep - 1);
    saveToStorage("step", currentStep - 1);

    if (currentStep === 2) {
      setPAT(undefined);
      saveToStorage("patCode", undefined); // To-do: encrypt/decrypt during storing and retrieval of PAT code between extension storage and retrieval?
    }

    if (currentStep === 2 || currentStep === 3) {
      setActiveNumPRs([]);
      saveToStorage("activeNumPRs", []);
    }

    if (currentStep === 1) {
      setPAT(undefined);
    }
  };

  async function handleClick() {
    if (activeNumPRs.length !== 0) {
      console.log("activeNumPRs array is not empty");
      updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
      saveToStorage("activeNumPRs", activeNumPRs);
    } else {
      console.log("activeNumPRs array is empty");
    }

    if (currentStep === 3) {
      setStepState(currentStep + 1);
      saveToStorage("step", currentStep + 1);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        marginBottom: "20px",
      }}
    >
      {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
        <div style={{ marginRight: `${currentStep === 2 ? "20px" : "60px"}` }}>
          <ButtonCustom
            type="back"
            setStep={() => handleStepChange({ currentStep, setRepoDetails })}
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
            onClick={handleClick}
            activeNumPRs={activeNumPRs}
          />
        </div>
      )}
    </div>
  );
};

export default HeaderComponent;
