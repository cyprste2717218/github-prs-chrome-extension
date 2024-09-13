import React from "react";
import { RepoCardComponentDetails } from "./RepoCardModels";
import { ActiveNumPRs } from "./RepoCardModels";

type CustomProps = {
  type: string;
};

type ButtonProps<T = {}> = CustomProps & T;

type CustomButtonProps =
  | (RefreshButtonProps & { type: "refresh" })
  | (SubmitButtonProps & { type: "submit" })
  | (BackButtonProps & { type: "back" })
  | (NextButtonProps & { type: "next" });

type RefreshButtonProps = ButtonProps<{
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  activeNumPRs: ActiveNumPRs[];
  currentStep: number;
  repoOwner: string;
}>;

type SubmitButtonProps = ButtonProps<{
  username: string;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>;

type BackButtonProps = ButtonProps<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
}>;

type NextButtonProps = ButtonProps<{
  onClick: () => void;
}>;

export type {
  RefreshButtonProps,
  SubmitButtonProps,
  BackButtonProps,
  CustomButtonProps,
  NextButtonProps,
};
