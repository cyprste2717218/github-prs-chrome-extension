import { ChangeEvent } from "react";
import {
  GeneratedDisplayRepoCards,
  GeneratedPreviewRepoCards,
} from "./RepoCardComponents";
import ButtonCustom from "./ButtonCustom";
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
import InputCustom from "./InputCustom.tsx";

const StepOneComponent = ({ setHasPAT, setStep }: StepOneComponentProps) => {
  function handleUsernamePATButtonClick() {
    setHasPAT("");
    setStep(2);
  }

  function handleUsernameButtonClick() {
    setStep(2);
    setHasPAT(null);
  }

  return (
    <>
      <div>
        <div
          style={{ marginBottom: "10px" }}
          onClick={handleUsernameButtonClick}
        >
          <ButtonCustom type="username" />
        </div>
        <Separator className="my-4" />

        <div onClick={() => handleUsernamePATButtonClick()}>
          <ButtonCustom type="usernameWithPAT" />
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
  setStep,
  setPAT,
  username,
  PAT,
}: StepTwoComponentProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event?.target?.value);
    saveToStorage("username", username);
  };

  const handlePATChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPAT(event?.target?.value); // no saving PAT to extension storage for security purposes
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
      <InputCustom
        type="username"
        username={username}
        handleUserNameChange={handleUserNameChange}
      />
      {PAT !== null && (
        <InputCustom type="PAT" PAT={PAT} handlePATChange={handlePATChange} />
      )}

      <ButtonCustom
        type="submit"
        username={username}
        setRepoDetails={setRepoDetails}
        setStep={setStep}
      />
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
  hasPAT,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = (
        <StepOneComponent setStep={setStep} setHasPAT={setHasPAT} />
      );
      break;

    case 2:
      CurrentStepUI = (
        <StepTwoComponent
          username={username}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
          setPAT={setHasPAT}
          repoDetails={repoDetails}
          currentStep={step}
          PAT={hasPAT}
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
