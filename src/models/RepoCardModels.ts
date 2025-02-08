import { SetStateAction } from "react";

type RepoCardComponentDetails = {
  name: string;
  description: string;
  language: string;
  step: number;
  clone_url: string;
  isRepoChecked: boolean;
  topics: string[];
};

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
};

type RepoPropsShared = {
  name: string;
};

type PreviewRepoCardProps = {
  description: string;
  language: string;
  topics: string[];
  step: number;
  clone_url: string;
  isRepoChecked: boolean;
  activeNumPRs: ActiveNumPRs[];
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
} & RepoPropsShared;

type DisplayRepoCardProps = {
  githubUsername: string;
  numPRs: number;
} & RepoPropsShared;

type GeneratedRepoCardsProps = {
  repoDetails: RepoCardComponentDetails[] | null;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setRepoDetails: React.Dispatch<
    SetStateAction<RepoCardComponentDetails[] | null>
  >;
  username: string;
  patCode: string | null;
  numPageResults: number | null;
  activeNumPRs: ActiveNumPRs[];
  step: number;
};

export type {
  RepoCardComponentDetails,
  ActiveNumPRs,
  PreviewRepoCardProps,
  DisplayRepoCardProps,
  GeneratedRepoCardsProps,
};
