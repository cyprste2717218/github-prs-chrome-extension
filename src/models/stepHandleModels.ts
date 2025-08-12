import type {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "@/models/RepoCardModels";

type StepOperationType = { stepOperation: "stepBack" | "stepForward" | "stepSettings" };

type HandleStepBackProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  setReposToggled: React.Dispatch<React.SetStateAction<boolean>>;
} & HandleStepCommonProps;

type HandleStepForwardProps = {
  repoOwner: string;
  activeNumPRs: ActiveNumPRs[];
} & HandleStepCommonProps;

type HandleStepCommonProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  currentStep: number;
  goalStep?: number;
  initialValuePAT: string | null;
};

// To-do: set this to work with either HandleStepBackProps or HandleStepForwardProps
type HandleStepChangeProps = (HandleStepBackProps & HandleStepForwardProps) &
  StepOperationType;

export type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
};
