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
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  repoDetails: RepoCardComponentDetails[] | null;
  step: number;
  activeNumPRs: ActiveNumPRs[];
  hasPAT: string | null;
  repoOwner: string;
  numPageResults: number | null;
};

type StepOneComponentProps = {
  setHasPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
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
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  activeNumPRs: ActiveNumPRs[];
  username: string;
  currentStep: number;
  repoDetails: RepoCardComponentDetails[] | null;
  PAT: string | null;
};

type StepThreeComponentProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  numPageResults: number | null;
  activeNumPRs: ActiveNumPRs[];
  step: number;
  repoDetails: RepoCardComponentDetails[] | null;
  username: string;
  patCode: string | null;
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
