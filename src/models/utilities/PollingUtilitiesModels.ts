import { ActiveNumPRs } from "../frontend/RepoCardModels";

type StartPollingProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

export type { StartPollingProps };
