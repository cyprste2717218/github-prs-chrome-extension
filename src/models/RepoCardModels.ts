type RepoCardComponentDetails = {
  name: string;
  description: string;
  language: string;
  step: number;
  clone_url: string;
  topics: string[];
};

type ActiveNumPRs = {
  name: string;
  numActivePRs: number;
};

export type { RepoCardComponentDetails, ActiveNumPRs };
