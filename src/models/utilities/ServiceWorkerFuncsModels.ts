import type { ActiveNumPRs } from "../frontend/RepoCardModels";

type SuccessFetchNumPRs = {
  name: string;
  numActivePRs: number;
  expiry: Date | null;
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

type StoragePollingAlarm = {
  retrievedPollingRate: number;
  trackedRepoDetails: ActiveNumPRs[];
  alarmType: string;
};

type StorageRateLimitErrorAlarm = {
  delayPeriod: number;
  alarmType: string;
};

type StorageAlarm = StoragePollingAlarm | StorageRateLimitErrorAlarm;

export type {
  SuccessFetchNumPRs,
  FailureFetchNumPRs,
  FetchNumPRs,
  HandleUpdateActiveNumPRs,
  StoragePollingAlarm,
  StorageRateLimitErrorAlarm,
  StorageAlarm,
};
