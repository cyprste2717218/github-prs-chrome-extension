import { ActiveNumPRs } from "./RepoCardModels";

type StartPollingProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setIntervalId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

export type { StartPollingProps };
