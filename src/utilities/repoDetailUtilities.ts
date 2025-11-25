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
import type { OctokitResponse } from "@octokit/types";
import { updatePRDetails } from "./pollingUtilities.ts";
import { saveToLocalStorage } from "./service-worker-funcs/storage-utils.ts";
import { getToast } from "./toastMessages.ts";
import { toast } from "sonner";

async function handleSubmitUserName({
  username,
  patCode,
  currentResultPageNum = 1,
}: RepoDetailUtilities) {
  if (!username) {
    console.warn("No username entered, no repos fetched");
    return;
  }

  try {
    const results = await handleFetchUserRepos(
      username,
      patCode,
      currentResultPageNum
    );
    await saveToLocalStorage("repoDetails", results);
  } catch (e) {
    console.warn("Error in handleSubmitUserName:", e);
    const debugMessage = `Error during fetching public repos for user ${username}`;

    console.warn(debugMessage);

    throw e;
  }
}

async function handleFetchUserRepos(
  /* setNumPageResults: React.Dispatch<React.SetStateAction<number>>, */
  username: string,
  patCode: string | null,
  resultPageNum: number
): Promise<RepoCardComponentDetails[] | undefined> {
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
      //setNumPageResults(lastValidPageNumber);
      await saveToLocalStorage("numPageResults", lastValidPageNumber);
      console.log("lastValidPageNumber:", lastValidPageNumber);

      return lastValidPageNumber;
    } catch (error) {
      console.error(
        "Error: couldn't retrieve number of last page of paginated results"
      );
    }
  }

  async function handleUnauthenticatedFetch(
    username: string,
    resultPageNum: number
  ): Promise<OctokitResponse<any>> {
    console.log("patCode is not defined", patCode);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?page=${resultPageNum}`
      );

      console.log("unauthenticated fetch response:", response.headers);
      await checkResponseHeaders(response);

      // parse results
      parsedResults = await response.json();
      console.log("fetchUserRepos results:", parsedResults);

      if (parsedResults && parsedResults.message) {
        if (parsedResults.message.includes("API rate limit exceeded")) {
          throw new Error("Rate Limit Error encountered");
        }
      }
      return parsedResults;
    } catch (e) {
      console.error("Error during unauthenticated fetch:", e);
      throw e;
    }
  }

  async function handleAuthenticatedFetch(
    username: string,
    resultPageNum: number,
    patCode: string
  ): Promise<OctokitResponse<any>> {
    console.log("patCode is defined", patCode);

    try {
      const requestWithAuth = request.defaults({
        headers: {
          authorization: `token ${patCode}`,
        },
      });

      const response = await requestWithAuth(
        `GET /users/${username}/repos?page=${resultPageNum}`
      );

      await checkResponseHeaders(response);

      // parse results
      parsedResults = response.data;
      console.log("results:", parsedResults);

      if (parsedResults && parsedResults.message) {
        if (parsedResults.message.includes("API rate limit exceeded")) {
          throw new Error("Rate Limit Error encountered");
        }
      }

      return parsedResults;
    } catch (e) {
      console.error("Error during authenticated fetch:", e);
      throw e;
    }
  }

  if (!username) {
    console.warn("No username entered");
    return;
  }

  let parsedResults: any;

  try {
    if (patCode === null) {
      parsedResults = await handleUnauthenticatedFetch(username, resultPageNum);
    } else {
      parsedResults = await handleAuthenticatedFetch(
        username,
        resultPageNum,
        patCode
      );
    }

    if (!parsedResults) {
      console.error("No results retrieved from GitHub API:", parsedResults);
      throw new Error("Rate Limit Error encountered");
    }

    if (parsedResults.length > 0) {
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
      throw new Error("No Public Repos Found");
    }
  } catch (e) {
    console.error("Error fetching user repos:", e);
    throw e;
  }
}

async function handleRefresh({ activeNumPRs, repoOwner }: HandleRefreshProps) {
  try {
    if (
      activeNumPRs &&
      Array.isArray(activeNumPRs) &&
      activeNumPRs.length !== 0
    ) {
      console.log("activeNumPRs array is not empty");

      await updatePRDetails({
        activeNumPRs,
        repoOwner,
      });

      console.log("Completed manual refresh of PR details");
    } else {
      console.log("activeNumPRs array is empty");
    }
  } catch (e) {
    console.error("Error during manual refresh of PR details:", e);

    await saveToLocalStorage("isRefreshing", false);
    throw e;
  }
}

async function handleChangePageResults({
  setNumPageResults,
  setRepoDetails,
  username,
  patCode,
  currentResultPageNum,
}: HandleChangePageResultsProps) {
  console.log(
    `fetching page ${currentResultPageNum} of github results for user ${username}`
  );

  // reset details stored
  await saveToLocalStorage("repoDetails", null);
  // store in state the current github repo result page number
  await saveToLocalStorage("activeResultsPage", currentResultPageNum);
  //setActiveResultsPage(currentResultPageNum);
  try {
    await handleSubmitUserName({
      setRepoDetails,
      setNumPageResults,
      username,
      patCode,
      currentResultPageNum,
    });
  } catch (error) {
    console.error("Error changing page results:", error);

    if (
      error instanceof Error &&
      error.message === "Rate Limit Error encountered"
    ) {
      const toastMessage = getToast("info", "rateLimitError");
      return toast.info(toastMessage);
    }
  }
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
