import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

type StepComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setHasPAT: React.Dispatch<React.SetStateAction<string | null>>;
  username: string;
  repoDetails: RepoCardComponentDetails[] | null;
  step: number;
  activeNumPRs: ActiveNumPRs[];
  hasPAT: string | null;
};

type StepOneComponentProps = {
  setHasPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

type StepTwoComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  username: string;
  currentStep: number;
  repoDetails: RepoCardComponentDetails[] | null;
  PAT: string | null;
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
