import type { ActiveNumPRs } from "../frontend/RepoCardModels";

type SuccessFetchNumPRs = {
  name: string;
  numActivePRs: number;
};

type FailureFetchNumPRs = {
  waitInterval: number;
  messages: string[];
};

type FetchNumPRs = SuccessFetchNumPRs | FailureFetchNumPRs;

type HandleUpdateActiveNumPRs = {
  activeNumPRs: ActiveNumPRs[];
  updatedPRDetails: SuccessFetchNumPRs;
  repoDetails: ActiveNumPRs;
};

export type {
  SuccessFetchNumPRs,
  FailureFetchNumPRs,
  FetchNumPRs,
  HandleUpdateActiveNumPRs,
};
