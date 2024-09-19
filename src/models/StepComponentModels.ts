import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

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

type StepOneComponentProps = {};

type StepTwoComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  currentStep: number;
  repoDetails: RepoCardComponentDetails[] | null;
};

type StepThreeComponentProps = {
  repoDetails: RepoCardComponentDetails[] | null;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  step: number;
};

type StepFourComponentProps = {
  activeNumPRs: ActiveNumPRs[];
};

export type {
  StepComponentProps,
  StepOneComponentProps,
  StepTwoComponentProps,
  StepThreeComponentProps,
  StepFourComponentProps,
};
