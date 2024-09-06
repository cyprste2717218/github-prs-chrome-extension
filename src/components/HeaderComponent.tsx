import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronLeft } from "@fortawesome/free-solid-svg-icons";

type HeaderProps = {
  currentStep: number;
  setStepState: React.Dispatch<React.SetStateAction<number>>;
};

const HeaderArrow = ({
  setStepState,
  currentStep,
}: HeaderProps): JSX.Element => {
  return (
    <div onClick={() => setStepState(currentStep - 1)}>
      <FontAwesomeIcon icon={faCircleChevronLeft} size="lg" />
    </div>
  );
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
      stepTitle = "";
      break;
  }

  return <h2>{stepTitle}</h2>;
};

const HeaderComponent = ({
  setStepState,
  currentStep,
}: HeaderProps): JSX.Element => {
  return (
    <div>
      {(currentStep === 2 || currentStep === 3) && (
        <HeaderArrow setStepState={setStepState} currentStep={currentStep} />
      )}
      <TitleComponent currentStep={currentStep} />
    </div>
  );
};

export default HeaderComponent;
