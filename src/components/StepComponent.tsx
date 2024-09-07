import React, { ChangeEvent } from "react";
import GeneratedRepoCards from "./RepoCardComponents";
import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import type {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "../models/RepoCardModels";
import { handleSubmitUserName } from "../utilities/repoDetailUtilities";
import "../App.css";

type StepComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  username: string;
  repoDetails: RepoCardComponentDetails[] | null;
  step: number;
  activeNumPRs: ActiveNumPRs[];
};

type StepOneComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  username: string;
};

type StepTwoComponentProps = {
  repoDetails: RepoCardComponentDetails[] | null;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  step: number;
};

type StepThreeComponentProps = {
  activeNumPRs: ActiveNumPRs[];
};

const StepOneComponent = ({
  setUsername,
  setRepoDetails,
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

      <Button
        variant="outline"
        onClick={() =>
          handleSubmitUserName({ username, setRepoDetails, setStep })
        }
        type="submit"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
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
    <GeneratedRepoCards
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
      {activeNumPRs.map((repo, index) => (
        <div key={index}>
          <h3>{repo.name}</h3>
          <p>Active Pull Requests: {repo.numActivePRs}</p>
        </div>
      ))}
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
