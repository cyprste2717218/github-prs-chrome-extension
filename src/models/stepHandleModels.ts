import type { ActiveNumPRs } from "@/models/RepoCardModels";

type StepOperationType = { stepOperation: "stepBack" | "stepFoward" };

type HandleStepBackProps = {
  setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
} & HandleStepCommonProps;

type HandleStepForwardProps = {
  repoOwner: string;
  activeNumPRs: ActiveNumPRs[];
  initialValuePAT: "" | undefined;
  setHasPAT: React.Dispatch<React.SetStateAction<"" | undefined>>;
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
