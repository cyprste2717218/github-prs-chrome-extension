import {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../frontend/RepoCardModels";

type RepoDetailUtilities = {
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  patCode: string | null;
  currentResultPageNum?: number;
};

type SubmitPRDetailsProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

type HandleRefreshProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  activeNumPRs: ActiveNumPRs[];
  currentStep: number;
  repoOwner: string;
};

type HandleChangePageResultsProps = {
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveResultsPage: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  patCode: string | null;
  currentResultPageNum: number;
};

type HandleToggleSingleRepoProps = {
  name: string;
  newCheckedState: boolean;
  activeNumPRs: ActiveNumPRs[];
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
};

type HandleToggleAllSelectedReposProps = {
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  repoDetails: RepoCardComponentDetails[];
  activeNumPRs: ActiveNumPRs[];
  allReposToggled: boolean;
};

export type {
  RepoDetailUtilities,
  SubmitPRDetailsProps,
  HandleRefreshProps,
  HandleChangePageResultsProps,
  HandleToggleSingleRepoProps,
  HandleToggleAllSelectedReposProps,
};
