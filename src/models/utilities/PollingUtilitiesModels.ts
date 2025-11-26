import { ActiveNumPRs } from "../frontend/RepoCardModels";

type StartPollingProps = {
  currentSliderValue: number;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  patCode: string | null;
};

export type { StartPollingProps };
