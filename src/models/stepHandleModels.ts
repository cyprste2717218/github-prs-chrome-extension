import type {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "@/models/RepoCardModels";

type StepOperationType = { stepOperation: "stepBack" | "stepForward" };

type HandleStepBackProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
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
