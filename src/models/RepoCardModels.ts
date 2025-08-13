import { SetStateAction } from "react";

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
  redirectUrl?: string;
};

type RepoPropsShared = {
  name: string;
};

type RepoDetails = {
  description: string;
  language: string;
  clone_url: string;
  topics: string[];
} & RepoPropsShared;

type RepoCardComponentDetails = {
  step: number;
} & RepoDetails;

type PreviewCardSharedProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  allReposToggled: boolean;
};

type PreviewRepoCardProps = PreviewCardSharedProps & RepoCardComponentDetails;

type AllPreviewRepoCardsProps = {
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    SetStateAction<RepoCardComponentDetails[] | null>
  >;
  repoDetails: RepoCardComponentDetails[] | null;
  username: string;
  patCode: string | null;
  numPageResults: number;
  step: number;
} & PreviewCardSharedProps;

type TrackedRepoCardProps = {
  githubUsername: string;
  numPRs: number;
} & RepoPropsShared;

type AllTrackedRepoCardProps = {
  activeNumPRs: ActiveNumPRs[];
  githubUsername: string;
};

type TrackedRepoRowProps = {
  repoOneName: string;
  repoTwoName: string;
  repoOneNumPRs: number;
  repoTwoNumPRs: number;
  githubUsername: string;
};

export type {
  RepoCardComponentDetails,
  ActiveNumPRs,
  PreviewRepoCardProps,
  AllPreviewRepoCardsProps,
  TrackedRepoCardProps,
  AllTrackedRepoCardProps,
  TrackedRepoRowProps,
};
