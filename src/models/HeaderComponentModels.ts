import { ActiveNumPRs } from "@/models/RepoCardModels";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";

type HeaderProps = {
	setStepState: React.Dispatch<React.SetStateAction<number>>;
	setRepoDetails: React.Dispatch<
	  React.SetStateAction<RepoCardComponentDetails[] | null>
	>;
	setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
	setPAT: React.Dispatch<React.SetStateAction<string | undefined>>;
	currentStep: number;
	activeNumPRs: ActiveNumPRs[];
	repoOwner: string;
	hasPAT: string | undefined;
  };


type TitleProps = {
	currentStep: number;
	hasPAT: string | undefined;
}

export type { HeaderProps, TitleProps };