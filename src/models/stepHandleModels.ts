import type {
  ActiveNumPRs,
  RepoCardComponentDetails,
} from "@/models/RepoCardModels";

type StepOperationType = { stepOperation: "stepBack" | "stepForward" };

type HandleStepBackProps = {
  setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
} & HandleStepCommonProps;

type HandleStepForwardProps = {
  repoOwner: string;
  activeNumPRs: ActiveNumPRs[];
  initialValuePAT: string | undefined;
  setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
} & HandleStepCommonProps;

type HandleStepCommonProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  currentStep: number;
};

// To-do: set this to work with either HandleStepBackProps or HandleStepForwardProps
type HandleStepChangeProps = (HandleStepBackProps & HandleStepForwardProps) &
  StepOperationType;

export type {
  HandleStepChangeProps,
  HandleStepBackProps,
  HandleStepForwardProps,
};
