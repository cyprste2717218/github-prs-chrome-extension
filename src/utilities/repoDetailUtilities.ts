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
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  username: string;
  patCode: string | null;
  resultPageNum?: number;
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

type HandleChangePageResultsProps = {
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  username: string;
  patCode: string | null;
  resultPageNum: number;
};

type HandleToggleAllSelectedRepos = {};

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
  setNumPageResults,
  username,
  patCode,
  resultPageNum = 1,
}: RepoDetailUtilities) {
  if (!username) {
    console.warn("No username entered, no repos fetched");
    return;
  }

  await handleFetchUserRepos(
    setNumPageResults,
    username,
    patCode,
    resultPageNum
  ).then((results) => {
    if (!results) {
      return;
    }
    setRepoDetails(results);
    // @ts-ignore
    saveToStorage("repoDetails", results);
  });
}

async function handleFetchUserRepos(
  setNumPageResults: React.Dispatch<React.SetStateAction<number | null>>,
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
      saveToStorage("numPageResults", lastValidPageNumber);
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

async function handleChangePageResults({
  setNumPageResults,
  setRepoDetails,
  username,
  patCode,
  resultPageNum = 1,
}: HandleChangePageResultsProps) {
  // reset details stored
  setRepoDetails(null);

  await handleSubmitUserName({
    setRepoDetails,
    setNumPageResults,
    username,
    patCode,
    resultPageNum,
  });
}

async function handleToggleAllSelectedRepos({}: HandleToggleAllSelectedRepos) {}

export {
  handleFetchUserRepos,
  handleSubmitUserName,
  handleRefresh,
  handleChangePageResults,
  updatePRDetails,
  handleToggleAllSelectedRepos,
};
