import React from "react";
import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";


type ButtonCustomProps = {
	type: string;
  } & (RefreshButtonProps & SubmitButtonProps);
  

type ButtonPropsCommon = {
	setStep: React.Dispatch<React.SetStateAction<number>>;
}

type RefreshButtonProps = {
	setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
	activeNumPRs: ActiveNumPRs[];
	currentStep: number;
	repoOwner: string;
} & ButtonPropsCommon

type SubmitButtonProps = {
	username: string;
	setRepoDetails: React.Dispatch<React.SetStateAction<RepoCardComponentDetails[] | null>>;
} & ButtonPropsCommon

export type { RefreshButtonProps, SubmitButtonProps, ButtonCustomProps }