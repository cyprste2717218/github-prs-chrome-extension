import { Fragment, useState } from "react";
import {
  handleSubmitUserName,
  handleRefresh,
} from "@/utilities/repoDetailUtilities";
import {
  RefreshButtonProps,
  SubmitButtonProps,
  CustomButtonProps,
  BackButtonProps,
  NextButtonProps,
  UsernameWithPATButtonProps,
  UsernameButtonProps,
  LinkButtonProps,
} from "@/models/ButtonModels";
import { Button } from "./ui/button";
import {
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { handleStepChange } from "@/utilities/setUpUtilities";

const LinkButton: React.FC<LinkButtonProps> = ({ text, url }) => (
  <a href={url}>
    <Button variant={"link"}>{text}</Button>
  </a>
);

const UsernameWithPATButton: React.FC<UsernameWithPATButtonProps> = ({}) => {
  return (
    <Button id="username-pat-entry-button" className="w-full h-18">
      <KeyRound className={`h-4 w-4`} />
      Enter Github Username/Org Name <br></br> and PAT
    </Button>
  );
};

const UsernameButton: React.FC<UsernameButtonProps> = ({}) => {
  return (
    <Button id="username-entry-button" variant="outline" className="w-full">
      Enter Github Username/Org Name
    </Button>
  );
};

const RefreshButton: React.FC<RefreshButtonProps> = ({
  setActiveNumPRs,
  setStep,
  activeNumPRs,
  currentStep,
  repoOwner,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = () => {
    console.log("pressed refresh button");
    setIsRefreshing(true);
    handleRefresh({
      setActiveNumPRs,
      setStep,
      activeNumPRs,
      currentStep,
      repoOwner,
    });
    setIsRefreshing(false);
    console.log("succesfully refreshed prs");
  };

  return (
    <Button onClick={handleClick} variant="outline">
      <RefreshCw className={`h-4 w-4 ${isRefreshing && "animate-spin"}`} />
    </Button>
  );
};

const BackButton: React.FC<BackButtonProps> = ({ setStep, currentStep }) => {
  return (
    <Button
      onClick={() => setStep(currentStep - 1)}
      variant="outline"
      className="primary-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

const NextButton: React.FC<NextButtonProps> = ({ onClick, activeNumPRs }) => {
  const isDisabled = activeNumPRs.length === 0;

  return (
    <Button
      disabled={isDisabled}
      variant="outline"
      onClick={onClick}
      className="primary-foreground"
      id="next-button"
    >
      <p style={{ paddingRight: "2px" }}>Next</p>
      <div style={{ marginTop: "auto", marginBottom: "auto" }}>
        <div>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Button>
  );
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  setRepoDetails,
  setStep,
  setPAT,
  setActiveNumPRs,
  setUsername,
  setNumPageResults,
  setDisplayWarning,
  currentStep,
  repoOwner,
  activeNumPRs,
  username,
  patCode,
}) => {
  const buttonStateBundle = {
    setStepState: setStep,
    setPAT: setPAT,
    setActiveNumPRs: setActiveNumPRs,
    setUsername: setUsername,
    setRepoDetails: setRepoDetails,
    setNumPageResults: setNumPageResults,
    setDisplayWarning: setDisplayWarning,
    currentStep: currentStep,
    repoOwner: repoOwner,
    activeNumPRs: activeNumPRs,
  };

  async function handleSubmitButtonPress() {
    await handleSubmitUserName({
      username,
      patCode,
      setRepoDetails,
      setNumPageResults,
    });
    handleStepChange({
      ...buttonStateBundle,
      stepOperation: "stepForward",
      initialValuePAT: patCode,
    });
  }

  let isDisabled: boolean;

  if (patCode !== null) {
    isDisabled = username.length === 0 || patCode.length === 0;
  } else {
    isDisabled = username.length === 0;
  }

  return (
    <Button
      id="submit-button"
      variant="outline"
      onClick={handleSubmitButtonPress}
      className="primary-foreground"
      disabled={isDisabled}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
};

const ButtonCustom: React.FC<CustomButtonProps> = (props) => {
  switch (props.type) {
    case "refresh":
      return <RefreshButton {...props} />;
    case "submit":
      return <SubmitButton {...props} />;
    case "back":
      return <BackButton {...props} />;
    case "next":
      return <NextButton {...props} />;
    case "username":
      return <UsernameButton {...props} />;
    case "usernameWithPAT":
      return <UsernameWithPATButton {...props} />;
    case "link":
      return <LinkButton {...props} />;
    default:
      return <Fragment></Fragment>;
  }
};

export default ButtonCustom;
