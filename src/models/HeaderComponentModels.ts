import { ActiveNumPRs } from "@/models/RepoCardModels";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";
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
  setIntervalId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>;
  allReposToggled: boolean;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  repoDetails: RepoCardComponentDetails[] | null;
  argIntervalId: NodeJS.Timeout | null;
  signal: AbortSignal;
} & TitleProps;

export type { HeaderProps, TitleProps };
