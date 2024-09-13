import { ChangeEvent } from "react";
import {
  GeneratedDisplayRepoCards,
  GeneratedPreviewRepoCards,
} from "./RepoCardComponents";
import ButtonCustom from "./ButtonCustom";
import { ButtonLoading } from "./ui/loadingButton";
import { Input } from "@/components/ui/input";
import type {
  StepComponentProps,
  StepOneComponentProps,
  StepTwoComponentProps,
  StepThreeComponentProps,
} from "@/models/StepComponentModels";

import "../App.css";

const StepOneComponent = ({
  setUsername,
  setRepoDetails,
  repoDetails,
  currentStep,
  setStep,
  username,
}: StepOneComponentProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event?.target?.value);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        columnGap: "10px",
        marginTop: "20px",
        color: "#000",
      }}
    >
      <Input
        className="placeholder"
        type="text"
        placeholder="e.g. @rollingwolf238"
        value={username}
        onChange={(e) => handleUserNameChange(e)}
      ></Input>

      {!repoDetails && currentStep === 1 ? (
        <ButtonCustom
          type="submit"
          username={username}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
        />
      ) : (
        <ButtonLoading />
      )}
    </div>
  );
};

const StepTwoComponent = ({
  repoDetails,
  setActiveNumPRs,
  activeNumPRs,
  step,
}: StepTwoComponentProps) => {
  return (
    <GeneratedPreviewRepoCards
      setActiveNumPRs={setActiveNumPRs}
      activeNumPRs={activeNumPRs}
      repoDetails={repoDetails}
      step={step}
    />
  );
};

const StepThreeComponent = ({ activeNumPRs }: StepThreeComponentProps) => {
  return (
    <>
      <GeneratedDisplayRepoCards activeNumPRs={activeNumPRs} />
    </>
  );
};

const StepComponent = ({
  setUsername,
  setRepoDetails,
  setActiveNumPRs,
  setStep,
  username,
  repoDetails,
  step,
  activeNumPRs,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = (
        <StepOneComponent
          username={username}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
          repoDetails={repoDetails}
          currentStep={step}
        />
      );
      break;

    case 2:
      CurrentStepUI = (
        <StepTwoComponent
          setActiveNumPRs={setActiveNumPRs}
          activeNumPRs={activeNumPRs}
          repoDetails={repoDetails}
          step={step}
        />
      );
      break;

    case 3:
      CurrentStepUI = <StepThreeComponent activeNumPRs={activeNumPRs} />;
      break;
  }

  return CurrentStepUI;
};

export default StepComponent;
