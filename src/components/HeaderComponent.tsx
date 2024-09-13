import ButtonCustom from "./ButtonCustom";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";
import "../App.css";

type HeaderProps = {
  currentStep: number;
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
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
      stepTitle = "Select the Repositories to Track";
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
  currentStep,
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {(currentStep === 2 || currentStep === 3) && (
        <ButtonCustom
          type="back"
          setStep={() => handleStepChange({ currentStep, setRepoDetails })}
          currentStep={currentStep}
        />
      )}
      <div
        style={{ marginTop: "auto", marginBottom: "auto", paddingLeft: "5px" }}
      >
        <TitleComponent currentStep={currentStep} />
      </div>
    </div>
  );
};

export default HeaderComponent;
