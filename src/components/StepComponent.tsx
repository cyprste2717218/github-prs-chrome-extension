import { ChangeEvent } from "react";
import {
  GeneratedDisplayRepoCards,
  GeneratedPreviewRepoCards,
} from "./RepoCardComponents";
import ButtonCustom from "./ButtonCustom";
import { Label } from "@/components/ui/label";
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
import { handleStepChange } from "@/utilities/setUpUtilities.ts";

const StepOneComponent = ({
  setHasPAT,
  setStep,
  setActiveNumPRs,
  currentStep,
  repoOwner,
  activeNumPRs,
}: StepOneComponentProps) => {
  const buttonStateBundle = {
    setStepState: setStep,
    setPAT: setHasPAT,
    setActiveNumPRs: setActiveNumPRs,
    currentStep: currentStep,
    repoOwner: repoOwner,
    activeNumPRs: activeNumPRs,
  };

  return (
    <>
      <div>
        <div
          style={{ marginBottom: "10px" }}
          onClick={() =>
            handleStepChange({
              ...buttonStateBundle,
              stepOperation: "stepForward",
              initialValuePAT: undefined,
            })
          }
        >
          <ButtonCustom type="username" />
        </div>
        <Separator className="my-4" />

        <div
          onClick={() =>
            handleStepChange({
              ...buttonStateBundle,
              stepOperation: "stepForward",
              initialValuePAT: "",
            })
          }
        >
          <ButtonCustom type="usernameWithPAT" />
        </div>
        <div className="mt-4 text-center text-sm">
          <a
            href="https://github.com/cyprste2717218/github-prs-chrome-extension/tree/dev#authenticated-approach"
            target="_blank"
          >
            Follow the readme here
          </a>{" "}
          to create a PAT (classic)
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
    setPAT(event?.target?.value);
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <Separator className="my-4" />
          <div style={{ margin: "5px", textAlign: "left" }}>
            <Label htmlFor="username">Your Github Username</Label>
          </div>

          <InputCustom
            type="username"
            username={username}
            handleUserNameChange={handleUserNameChange}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          {PAT !== undefined && (
            <>
              <div style={{ margin: "5px", textAlign: "left" }}>
                <Label htmlFor="githubPAT">
                  Your Github Personal Access Token (classic)
                </Label>
              </div>

              <InputCustom
                type="PAT"
                PAT={PAT}
                handlePATChange={handlePATChange}
              />
            </>
          )}
        </div>
        <div style={{ marginTop: "15px" }}>
          <ButtonCustom
            type="submit"
            username={username}
            patCode={PAT}
            setRepoDetails={setRepoDetails}
            setStep={setStep}
          />
        </div>
      </div>
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
  repoOwner,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = (
        <StepOneComponent
          setStep={setStep}
          setHasPAT={setHasPAT}
          setActiveNumPRs={setActiveNumPRs}
          currentStep={step}
          repoOwner={repoOwner}
          activeNumPRs={activeNumPRs}
        />
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
