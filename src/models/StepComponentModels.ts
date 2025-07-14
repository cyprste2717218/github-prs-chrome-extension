import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

type CommonProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  currentStep: number;
  activeNumPRs: ActiveNumPRs[];
};

type StepComponentProps = ChooseSetupOptProps &
  GitDetailsEntryProps &
  ChooseReposComponentProps &
  DisplayTrackedReposProps;

type ChooseSetupOptProps = {
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  setReposToggled: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
} & CommonProps;

type GitDetailsEntryProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  setReposToggled: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  repoDetails: RepoCardComponentDetails[] | null;
  patCode: string | null;
} & CommonProps;

type ChooseReposComponentProps = {
  numPageResults: number | null;
  repoDetails: RepoCardComponentDetails[] | null;
  username: string;
  patCode: string | null;
  reposToggled: boolean;
} & CommonProps;

type DisplayTrackedReposProps = {
  activeNumPRs: ActiveNumPRs[];
  username: string;
};

export type {
  StepComponentProps,
  ChooseSetupOptProps,
  GitDetailsEntryProps,
  ChooseReposComponentProps,
  DisplayTrackedReposProps,
};
