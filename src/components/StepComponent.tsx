import { ChangeEvent } from "react";
import {
  GeneratedDisplayRepoCards,
  GeneratedPreviewRepoCards,
} from "./RepoCardComponents";
import ButtonCustom from "./ButtonCustom";
import { Input } from "@/components/ui/input";
import { Separator } from "./ui/separator.tsx";
import type {
  StepComponentProps,
  StepOneComponentProps,
  StepTwoComponentProps,
  StepThreeComponentProps,
  StepFourComponentProps,
} from "@/models/StepComponentModels";

import "../App.css";
import { saveToStorage } from "../../public/background.ts";

const StepOneComponent = ({ setHasPAT }: StepOneComponentProps) => {
  return (
    <>
      <div>
        <div style={{ marginBottom: "10px" }}>
          <ButtonCustom type="username" setHasPAT={setHasPAT} />
        </div>
        <Separator className="my-4" />

        <div>
          <ButtonCustom type="usernameWithPAT" setHasPAT={setHasPAT} />
        </div>
        <div className="mt-4 text-center text-sm">
          Find out how to <a href="">create a PAT (classic) here</a>
        </div>
      </div>
    </>
  );
};

const StepTwoComponent = ({
  setUsername,
  setRepoDetails,
  currentStep,
  setStep,
  username,
}: StepTwoComponentProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event?.target?.value);
    saveToStorage("username", username);
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

      {currentStep === 2 && (
        <ButtonCustom
          type="submit"
          username={username}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
        />
      )}
    </div>
  );
};

const StepThreeComponent = ({
  repoDetails,
  setActiveNumPRs,
  activeNumPRs,
  step,
}: StepThreeComponentProps) => {
  return (
    <GeneratedPreviewRepoCards
      setActiveNumPRs={setActiveNumPRs}
      activeNumPRs={activeNumPRs}
      repoDetails={repoDetails}
      step={step}
    />
  );
};

const StepFourComponent = ({ activeNumPRs }: StepFourComponentProps) => {
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
  setHasPAT,
  setStep,
  username,
  repoDetails,
  step,
  activeNumPRs,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = <StepOneComponent setHasPAT={setHasPAT} />;
      break;

    case 2:
      CurrentStepUI = (
        <StepTwoComponent
          username={username}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
          repoDetails={repoDetails}
          currentStep={step}
        />
      );
      break;

    case 3:
      CurrentStepUI = (
        <StepThreeComponent
          setActiveNumPRs={setActiveNumPRs}
          activeNumPRs={activeNumPRs}
          repoDetails={repoDetails}
          step={step}
        />
      );
      break;

    case 4:
      CurrentStepUI = <StepFourComponent activeNumPRs={activeNumPRs} />;
  }

  return CurrentStepUI;
};

export default StepComponent;
