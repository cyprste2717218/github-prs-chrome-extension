import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

type StepComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setHasPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
  username: string;
  repoDetails: RepoCardComponentDetails[] | null;
  step: number;
  activeNumPRs: ActiveNumPRs[];
  hasPAT: string | undefined;
  repoOwner: string;
};

type StepOneComponentProps = {
  setHasPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  currentStep: number;
  repoOwner: string;
  activeNumPRs: ActiveNumPRs[];
};

type StepTwoComponentProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  username: string;
  currentStep: number;
  repoDetails: RepoCardComponentDetails[] | null;
  PAT: string | undefined;
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
