import React from "react";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/RepoCardModels";
import { request } from "@octokit/request";
import { loadFromStorage, saveToStorage } from "../../public/background.ts";

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
  const storedPATCode = await loadFromStorage("patCode");

  const updatedNumPRs = await Promise.all(
    activeNumPRs.map(async (repo) => {
      const repoName = repo.name;
      const owner = repoOwner;
      const currentNumPRs = repo.numActivePRs;
      let results: any;

      if (!storedPATCode) {
        // unauthenticated request

        results = await request(`GET /repos/${owner}/${repoName}/pulls`, {
          owner: owner,
          repo: repoName,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }).then((response) => response.data);
      } else {
        // authenticated request

        const requestWithAuth = request.defaults({
          headers: {
            authorization: `token ${storedPATCode}`,
          },
        });

        let response = await requestWithAuth(
          `GET /repos/${owner}/${repoName}/pulls`
        );
        results = response.data;
      }

      // update number of PRs for repo if number changed
      let updatedNumPRs: number = currentNumPRs;
      if (currentNumPRs !== results.length) {
        updatedNumPRs = results.length;
      }

      console.log("github prs fetched:", results);

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
    // @ts-ignore
    saveToStorage("repoDetails", results);
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
    console.log("patCode is not defined", patCode);
    results = await fetch(
      `https://api.github.com/users/${username}/repos`
    ).then((response) => response.json());
  } else {
    console.log("patCode is defined", patCode);
    const requestWithAuth = request.defaults({
      headers: {
        authorization: `token ${patCode}`,
      },
    });

    let response = await requestWithAuth(`GET /users/${username}/repos`);

    results = response.data;
    console.log("results:", results);
  }

  if (results?.length > 0) {
    const relevantDetails = results.map((repo: any) => {
      let shortenedDesc = "";

      if (repo.description && repo.description.length > 150) {
        shortenedDesc = repo.description.slice(0, 150) + "...";
      } else if (repo.description) {
        shortenedDesc = repo.description;
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
