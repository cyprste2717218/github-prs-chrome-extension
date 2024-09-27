import React from "react";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/RepoCardModels";
import { request } from "@octokit/request";
import { saveToStorage } from "../../public/background.ts";

import { Octokit } from "@octokit/core";

type RepoDetailUtilities = {
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  patCode?: string;
};

type SubmitPRDetailsProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
};

type HandleRefreshProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  activeNumPRs: ActiveNumPRs[];
  currentStep: number;
  repoOwner: string;
};

async function updatePRDetails({
  setActiveNumPRs,
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps) {
  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);

  const updatedNumPRs = await Promise.all(
    activeNumPRs.map(async (repo) => {
      const repoName = repo.name;
      const owner = repoOwner;
      const currentNumPRs = repo.numActivePRs;

      const response = await request(`GET /repos/${owner}/${repoName}/pulls`, {
        owner: owner,
        repo: repoName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }).then((response) => response.data);

      // update number of PRs for repo if number changed
      let updatedNumPRs: number = currentNumPRs;
      if (currentNumPRs !== response.length) {
        updatedNumPRs = response.length;
      }

      console.log("github prs fetched:", response);

      return {
        name: repoName,
        numActivePRs: updatedNumPRs,
      };
    })
  );

  setActiveNumPRs(updatedNumPRs);
  saveToStorage("activeNumPRs", updatedNumPRs);
}

async function handleSubmitUserName({
  // To-do: rename this to handleSubmitDetails to make it more reflective of what function does
  setRepoDetails,
  setStep,
  username,
  patCode,
}: RepoDetailUtilities) {
  if (!username) {
    console.warn("No username entered, no repos fetched");
    return;
  }

  await handleFetchUserRepos(username, patCode).then((results) => {
    if (!results) {
      return;
    }
    setRepoDetails(results);
    setStep(3);
    // @ts-ignore
    saveToStorage("repoDetails", results);
    saveToStorage("step", 3);
  });
}

async function handleFetchUserRepos(
  username: string,
  patCode?: string
): Promise<RepoCardComponentDetails[] | undefined> {
  if (!username) {
    console.warn("No username entered");
    return;
  }

  let results: any;

  if (patCode === undefined) {
    results = await fetch(
      `https://api.github.com/users/${username}/repos`
    ).then((response) => response.json());
  } else {
    const octokit = new Octokit({ auth: patCode });

    results = await octokit.request("GET /users/{username}/repos", {
      username: username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }

  if (results?.length > 0) {
    const relevantDetails = results.map((repo: any) => {
      let shortenedDesc = repo.description;

      if (repo.description.length > 150) {
        shortenedDesc = repo.description.slice(0, 150) + "...";
      }

      return {
        name: repo.name,
        clone_url: repo.clone_url,
        description: shortenedDesc,
        language: repo.language,
        topics: repo.topics,
      };
    });

    return relevantDetails;
  } else {
    return undefined;
  }
}

async function handleRefresh({
  activeNumPRs,
  setActiveNumPRs,
  repoOwner,
}: HandleRefreshProps) {
  if (activeNumPRs.length !== 0) {
    console.log("activeNumPRs array is not empty");
    updatePRDetails({ setActiveNumPRs, activeNumPRs, repoOwner });
    saveToStorage("activeNumPRs", activeNumPRs);
  } else {
    console.log("activeNumPRs array is empty");
  }
}

export {
  handleFetchUserRepos,
  handleSubmitUserName,
  handleRefresh,
  updatePRDetails,
};
