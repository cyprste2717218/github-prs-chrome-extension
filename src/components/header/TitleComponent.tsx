import { TitleProps } from "@/models/HeaderComponentModels";

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
        <h2 className="stepTitle" style={{ textAlign: "left" }}>
          {stepTitle}
        </h2>
      </div>
    </div>
  );
};

export default TitleComponent;
