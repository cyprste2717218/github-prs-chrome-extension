type RepoCardComponentDetails = {
  name: string;
  clone_url: string;
};

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
};

export type { RepoCardComponentDetails, ActiveNumPRs };
