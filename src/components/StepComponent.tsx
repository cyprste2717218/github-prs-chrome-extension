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
import InputCustom from "./InputCustom.tsx";
import { handleStepChange } from "@/utilities/setUpUtilities.ts";

const StepOneComponent = ({
  setHasPAT,
  setStep,
  setActiveNumPRs,
  setUsername,
  setRepoDetails,
  setNumPageResults,
  setDisplayWarning,
  currentStep,
  repoOwner,
  activeNumPRs,
}: StepOneComponentProps) => {
  const buttonStateBundle = {
    setStepState: setStep,
    setPAT: setHasPAT,
    setActiveNumPRs: setActiveNumPRs,
    setUsername: setUsername,
    setRepoDetails: setRepoDetails,
    setNumPageResults: setNumPageResults,
    setDisplayWarning: setDisplayWarning,
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
              initialValuePAT: null,
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
  setActiveNumPRs,
  setStep,
  setPAT,
  setNumPageResults,
  setDisplayWarning,
  currentStep,
  username,
  activeNumPRs,
  PAT,
}: StepTwoComponentProps) => {
  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event?.target?.value);
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
            <Label htmlFor="username">Github Username/Org Name</Label>
          </div>

          <InputCustom
            type="username"
            username={username}
            handleUserNameChange={handleUserNameChange}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          {PAT !== null && (
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
            currentStep={currentStep}
            repoOwner={username}
            activeNumPRs={activeNumPRs}
            initialValuePAT={PAT}
            setRepoDetails={setRepoDetails}
            setStep={setStep}
            setPAT={setPAT}
            setActiveNumPRs={setActiveNumPRs}
            setUsername={setUsername}
            setNumPageResults={setNumPageResults}
            setDisplayWarning={setDisplayWarning}
          />
        </div>
      </div>
    </div>
  );
};

const StepThreeComponent = ({
  repoDetails,
  setActiveNumPRs,
  setNumPageResults,
  setRepoDetails,
  activeNumPRs,
  step,
  numPageResults,
  username,
  patCode,
}: StepThreeComponentProps) => {
  return (
    <GeneratedPreviewRepoCards
      setActiveNumPRs={setActiveNumPRs}
      setNumPageResults={setNumPageResults}
      activeNumPRs={activeNumPRs}
      repoDetails={repoDetails}
      step={step}
      numPageResults={numPageResults}
      setRepoDetails={setRepoDetails}
      username={username}
      patCode={patCode}
    />
  );
};

const StepFourComponent = ({
  activeNumPRs,
  githubUsername,
}: StepFourComponentProps) => {
  return (
    <>
      <GeneratedDisplayRepoCards
        githubUsername={githubUsername}
        activeNumPRs={activeNumPRs}
      />
    </>
  );
};

const StepComponent = ({
  setUsername,
  setRepoDetails,
  setActiveNumPRs,
  setHasPAT,
  setStep,
  setNumPageResults,
  setDisplayWarning,
  username,
  repoDetails,
  step,
  activeNumPRs,
  hasPAT,
  repoOwner,
  numPageResults,
}: StepComponentProps) => {
  let CurrentStepUI = <></>;

  switch (step) {
    case 1:
      CurrentStepUI = (
        <StepOneComponent
          setStep={setStep}
          setHasPAT={setHasPAT}
          setActiveNumPRs={setActiveNumPRs}
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          currentStep={step}
          repoOwner={repoOwner}
          activeNumPRs={activeNumPRs}
        />
      );
      break;

    case 2:
      CurrentStepUI = (
        <StepTwoComponent
          setUsername={setUsername}
          setRepoDetails={setRepoDetails}
          setStep={setStep}
          setPAT={setHasPAT}
          setActiveNumPRs={setActiveNumPRs}
          setNumPageResults={setNumPageResults}
          setDisplayWarning={setDisplayWarning}
          activeNumPRs={activeNumPRs}
          username={username}
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
          setNumPageResults={setNumPageResults}
          setRepoDetails={setRepoDetails}
          username={username}
          patCode={hasPAT}
          numPageResults={numPageResults}
          activeNumPRs={activeNumPRs}
          repoDetails={repoDetails}
          step={step}
        />
      );
      break;

    case 4:
      CurrentStepUI = (
        <StepFourComponent
          githubUsername={username}
          activeNumPRs={activeNumPRs}
        />
      );
  }

  return CurrentStepUI;
};

export default StepComponent;
