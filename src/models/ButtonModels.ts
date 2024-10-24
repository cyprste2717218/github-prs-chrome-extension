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
  | (NextButtonProps & { type: "next" })
  | (UsernameWithPATButtonProps & { type: "usernameWithPAT" })
  | (UsernameButtonProps & { type: "username" })
  | (LinkButtonProps & { type: "link" });

type RefreshButtonProps = ButtonProps<{
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  activeNumPRs: ActiveNumPRs[];
  currentStep: number;
  repoOwner: string;
}>;

type SubmitButtonProps = ButtonProps<{
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  currentStep: number;
  repoOwner: string;
  activeNumPRs: ActiveNumPRs[];
  username: string;
  patCode: string | null;
  initialValuePAT: string | null;
}>;

type BackButtonProps = ButtonProps<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
}>;

type NextButtonProps = ButtonProps<{
  onClick: () => void;
  activeNumPRs: ActiveNumPRs[];
}>;

type UsernameWithPATButtonProps = ButtonProps<{}>;

type UsernameButtonProps = ButtonProps<{}>;

type LinkButtonProps = ButtonProps<{
  text: string;
  url: string;
}>;

export type {
  RefreshButtonProps,
  SubmitButtonProps,
  BackButtonProps,
  CustomButtonProps,
  NextButtonProps,
  UsernameWithPATButtonProps,
  UsernameButtonProps,
  LinkButtonProps,
};
