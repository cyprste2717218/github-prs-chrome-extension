import { ActiveNumPRs } from "@/models/RepoCardModels";
import type { RepoCardComponentDetails } from "@/models/RepoCardModels";
import React from "react";

type HeaderProps = {
  setStepState: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setPAT: React.Dispatch<React.SetStateAction<string | null>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  currentStep: number;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  hasPAT: string | null;
};

type TitleProps = {
  currentStep: number;
  hasPAT: string | null;
};

export type { HeaderProps, TitleProps };
