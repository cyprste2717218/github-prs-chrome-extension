import React from "react";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/frontend/RepoCardModels.ts";
import { request } from "@octokit/request";
import {
  HandleChangePageResultsProps,
  HandleRefreshProps,
  HandleToggleAllSelectedReposProps,
  HandleToggleSingleRepoProps,
  RepoDetailUtilities,
} from "@/models/utilities/RepoDetailUtilitiesModels.ts";
import { saveToLocalStorage, updatePRDetails } from "./service-worker-funcs/background.js";

async function handleSubmitUserName({
  // To-do: rename this to handleSubmitDetails to make it more reflective of what function does
  setRepoDetails,
  setNumPageResults,
  username,
  patCode,
  currentResultPageNum = 1,
}: RepoDetailUtilities) {
  if (!username) {
    console.warn("No username entered, no repos fetched");
    return;
  }

  await handleFetchUserRepos(
    setNumPageResults,
    username,
    patCode,
    currentResultPageNum
  ).then((results) => {
    if (!results) {
      throw new Error("No results returned from handleFetchUserRepos");
    } else {
      setRepoDetails(results);
    }
  });
}

async function handleFetchUserRepos(
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>,
  username: string,
  patCode: string | null,
  resultPageNum: number
): Promise<RepoCardComponentDetails[] | undefined> {
  if (!username) {
    console.warn("No username entered");
    return;
  }

  let parsedResults: any;
  let response: any;

  async function checkResponseHeaders(response: any) {
    function extractLastPageNumber(linkHeader: string) {
      // Remove the "link: " prefix if present
      const cleanHeader = linkHeader.startsWith("link: ")
        ? linkHeader.slice(6)
        : linkHeader;

      // Split the string into individual link entries
      const linkEntries = cleanHeader.split(", ");
      console.log("linkEntries:", linkEntries);
      // Parse each entry into an object

      const lastNumber = linkEntries.map((entry) => {
        const matches = entry.match(/page=(\d+).*rel="last"/);
        console.log("matches:", matches);
        if (matches) {
          return parseInt(matches[1], 10);
        }
        return null;
      });

      if (lastNumber[1] !== null) {
        return lastNumber[1];
      } else {
        throw new Error(
          "Couldn't retrieve number of last page of paginated results"
        );
      }
    }

    let lastValidPageNumber: number;

    // accesing and checking states of response headers
    const headers = response.headers;
    console.log("headers:", headers);
    console.log("full response:", response);

    // checking for paginated response from 'link' header presence
    let linkHeader: string;

    try {
      linkHeader = headers.get("link");
      console.log("linkHeader:", linkHeader);
    } catch (error) {
      console.log("error:", error);
      linkHeader = headers.link;
    }

    try {
      lastValidPageNumber = extractLastPageNumber(linkHeader);
      setNumPageResults(lastValidPageNumber);
      console.log("lastValidPageNumber:", lastValidPageNumber);

      return lastValidPageNumber;
    } catch (error) {
      console.error(
        "Error: couldn't retrieve number of last page of paginated results"
      );
    }
  }

  if (patCode === null) {
    console.log("patCode is not defined", patCode);
    response = await fetch(
      `https://api.github.com/users/${username}/repos?page=${resultPageNum}`
    );

    await checkResponseHeaders(response);

    // parse results
    parsedResults = await response.json();
  } else {
    console.log("patCode is defined", patCode);
    const requestWithAuth = request.defaults({
      headers: {
        authorization: `token ${patCode}`,
      },
    });

    response = await requestWithAuth(
      `GET /users/${username}/repos?page=${resultPageNum}`
    );

    await checkResponseHeaders(response);

    // parse results
    parsedResults = response.data;

    console.log("results:", parsedResults);
  }

  if (parsedResults?.length > 0) {
    const relevantDetails = parsedResults.map((repo: any) => {
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

async function handleRefresh({ activeNumPRs, repoOwner }: HandleRefreshProps) {
  if (
    activeNumPRs &&
    Array.isArray(activeNumPRs) &&
    activeNumPRs.length !== 0
  ) {
    console.log("activeNumPRs array is not empty");
    updatePRDetails({
      activeNumPRs,
      repoOwner,
    });
  } else {
    console.log("activeNumPRs array is empty");
  }
}

async function handleChangePageResults({
  setNumPageResults,
  setRepoDetails,
  /* setActiveResultsPage, */
  username,
  patCode,
  currentResultPageNum,
}: HandleChangePageResultsProps) {
  console.log(
    `fetching page ${currentResultPageNum} of github results for user ${username}`
  );

  // reset details stored
  setRepoDetails(null);
  // store in state the current github repo result page number
  saveToLocalStorage("currentResultPageNum", currentResultPageNum);
  //setActiveResultsPage(currentResultPageNum);

  await handleSubmitUserName({
    setRepoDetails,
    setNumPageResults,
    username,
    patCode,
    currentResultPageNum,
  });
}

async function handleToggleRepo({
  name,
  newCheckedState,
  activeNumPRs,
  /*  setActiveNumPRs, */
}: HandleToggleSingleRepoProps): Promise<void> {
  const currentRepoDetails: ActiveNumPRs[] = [...activeNumPRs];
  let updatedRepoDetails: ActiveNumPRs[] = [];

  if (!newCheckedState) {
    // logic for repo when click sets it to not be tracked, i.e. when checkbox is not marked
    console.log(`Removing repo details for ${name} repo`);

    updatedRepoDetails = currentRepoDetails.filter(
      (repo) => repo.name !== name
    );

    console.log("All Repo Details After Remove:", updatedRepoDetails);
  } else {
    // logic for repo when click sets it to be tracked, i.e. when checkbox is marked

    const existingRepo = currentRepoDetails.find((repo) => repo.name === name);

    // checking repo details aren't already present in arr storing tracked repos by mistake
    if (existingRepo) {
      return;
    } else {
      // repo details confirmed to not be present already so adding details of repo

      const newRepo = { name: name, numActivePRs: 0 };
      console.log(`Adding repo details for ${name} repo`);

      updatedRepoDetails = [...currentRepoDetails, newRepo];
      console.log("All Repo Details After Add:", updatedRepoDetails);
    }
  }

  saveToLocalStorage("activeNumPRs", updatedRepoDetails);
  //setActiveNumPRs(updatedRepoDetails);
}

async function handleToggleAllRepos({
  allReposToggled,
  repoDetails,
  /*   setActiveNumPRs,
    setRepoDetails, */
}: HandleToggleAllSelectedReposProps): Promise<void> {
  console.log("gets to here");
  const currentRepoArrDetails = repoDetails;
  let updatedOriginalRepoDetails: RepoCardComponentDetails[] = [];
  let updatedToggledRepos: ActiveNumPRs[] = [];

  // console.log("allReposToggled:", allReposToggled);

  // update all in-memory repos isRepoChecked to true or false
  updatedOriginalRepoDetails = currentRepoArrDetails.map(
    (repo: RepoCardComponentDetails) => ({
      ...repo,
      isRepoChecked: allReposToggled,
    })
  );

  console.log("updatedOriginalRepoDetails:", updatedOriginalRepoDetails);

  if (!allReposToggled) {
    // transform repo information to form required for activeNumPRs array
    updatedToggledRepos = updatedOriginalRepoDetails.map(
      (repo: RepoCardComponentDetails) => ({
        name: repo.name,
        numActivePRs: 0,
      })
    );
  }

  console.log("updatedToggledRepos:", updatedToggledRepos);

  saveToLocalStorage("activeNumPRs", updatedToggledRepos);
  saveToLocalStorage("repoDetails", updatedOriginalRepoDetails);
  //setRepoDetails(updatedOriginalRepoDetails);
  //setActiveNumPRs(updatedToggledRepos);
}

export {
  handleFetchUserRepos,
  handleSubmitUserName,
  handleRefresh,
  handleChangePageResults,
  handleToggleAllRepos,
  handleToggleRepo,
};
