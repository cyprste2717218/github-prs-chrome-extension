import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import type { RepoCardComponentDetails } from "@/models/frontend/RepoCardModels";
import React from "react";

type TitleProps = {
  currentStep: number;
  hasPAT: string | null;
};

type HeaderProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  setDisplayWarning: React.Dispatch<React.SetStateAction<boolean>>;
  setReposToggled: React.Dispatch<React.SetStateAction<boolean>>;
  isRefreshing: boolean;
  allReposToggled: boolean;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  repoDetails: RepoCardComponentDetails[] | null;
} & TitleProps;

export type { HeaderProps, TitleProps };
