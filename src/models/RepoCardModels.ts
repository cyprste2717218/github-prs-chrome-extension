type RepoCardComponentDetails = {
  name: string;
  step: number;
  clone_url: string;
};

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
};

export type { RepoCardComponentDetails, ActiveNumPRs };
