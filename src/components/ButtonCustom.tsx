import { Fragment, useState } from "react";
import {
  handleSubmitUserName,
  handleRefresh,
} from "@/utilities/repoDetailUtilities";
import {
  RefreshButtonProps,
  SubmitButtonProps,
  CustomButtonProps,
} from "@/models/ButtonModels";
import { Button } from "./ui/button";
import { RefreshCw, ChevronRight } from "lucide-react";

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

const SubmitButton: React.FC<SubmitButtonProps> = ({
  username,
  setRepoDetails,
  setStep,
}) => {
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

const ButtonCustom: React.FC<CustomButtonProps> = (props) => {
  switch (props.type) {
    case "refresh":
      return <RefreshButton {...props} />;
    case "submit":
      return <SubmitButton {...props} />;
    default:
      return <Fragment></Fragment>;
  }
};

export default ButtonCustom;
