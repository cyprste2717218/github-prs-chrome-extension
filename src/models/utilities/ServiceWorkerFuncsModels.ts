import type { ActiveNumPRs } from "../frontend/RepoCardModels";

type SuccessFetchNumPRs = {
  name: string;
  numActivePRs: number;
  toastMessages: string[];
};

type FailureFetchNumPRs = {
  waitInterval: number;
  toastMessages: string[];
  type: string;
};

type FetchNumPRs = SuccessFetchNumPRs | FailureFetchNumPRs;

type HandleUpdateActiveNumPRs = {
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
