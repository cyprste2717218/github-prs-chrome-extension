import { Fragment, useState } from "react";
import {
  handleSubmitUserName,
  handleRefresh,
} from "@/utilities/repoDetailUtilities";
import {
  RefreshButtonProps,
  SubmitButtonProps,
  ButtonCustomProps,
} from "@/models/ButtonModels";
import { Button } from "./ui/button";
import { RefreshCw, ChevronRight } from "lucide-react";

const RefreshButton = ({
  setActiveNumPRs,
  setStep,
  activeNumPRs,
  currentStep,
  repoOwner,
}: RefreshButtonProps) => {
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

const SubmitButton = ({
  username,
  setRepoDetails,
  setStep,
}: SubmitButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={() =>
        handleSubmitUserName({ username, setRepoDetails, setStep })
      }
      className="primary-foreground"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
};

const ButtonCustom = ({
  type,
  username,
  setRepoDetails,
  setStep,
  setActiveNumPRs,
  activeNumPRs,
  currentStep,
  repoOwner,
}: ButtonCustomProps) => {
  let button;

  switch (type) {
    case "refresh":
      button = (
        <RefreshButton
          setActiveNumPRs={setActiveNumPRs}
          setStep={setStep}
          activeNumPRs={activeNumPRs}
          currentStep={currentStep}
          repoOwner={repoOwner}
        />
      );
      break;
    case "submit":
      button = (
        <SubmitButton
          username={username}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
        />
      );
      break;
    default:
      button = <Fragment></Fragment>;
  }

  return { button };
};

export default ButtonCustom;
