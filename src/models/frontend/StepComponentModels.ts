import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

type CommonProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
  activeNumPRs: ActiveNumPRs[];
};

type StepComponentProps = ChooseSetupOptProps &
  GitDetailsEntryProps &
  ChooseReposComponentProps &
  DisplayTrackedReposProps &
  SettingsProps;

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
  setActiveResultsPage: React.Dispatch<React.SetStateAction<number>>;
  setReposToggled: React.Dispatch<React.SetStateAction<boolean>>;
  numPageResults: number;
  repoDetails: RepoCardComponentDetails[] | null;
  username: string;
  patCode: string | null;
  allReposToggled: boolean;
  activeResultsPage: number;
} & CommonProps;

type DisplayTrackedReposProps = {
  activeNumPRs: ActiveNumPRs[];
  username: string;
};

type SettingsProps = {
  setPollingRate: React.Dispatch<React.SetStateAction<number>>;
  pollingRate: number;
};

export type {
  StepComponentProps,
  ChooseSetupOptProps,
  GitDetailsEntryProps,
  ChooseReposComponentProps,
  DisplayTrackedReposProps,
  SettingsProps,
};
