import React from "react";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/frontend/RepoCardModels.ts";
import { request } from "@octokit/request";
import { RequestError } from "@octokit/request-error";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../../public/background.ts";
import {
  HandleChangePageResultsProps,
  HandleRefreshProps,
  HandleToggleAllSelectedReposProps,
  HandleToggleSingleRepoProps,
  RepoDetailUtilities,
  SubmitPRDetailsProps,
} from "@/models/utilities/RepoDetailUtilitiesModels.ts";

async function updatePRDetails({
  setActiveNumPRs,
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps) {
  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);
  const storedPATCode = await loadFromLocalStorage("patCode");
  let updatedNumPRs: ActiveNumPRs[] = [];

  type SucessFetchNumPRs = {
    name: string;
    numActivePRs: number;
  };

  type FailureFetchNumPRs = {
    waitInterval: number;
    messages: string[];
  };

  type FetchNumPRs = SucessFetchNumPRs | FailureFetchNumPRs;

  function isSuccessFetchNumPRs(obj: FetchNumPRs): obj is SucessFetchNumPRs {
    return (
      typeof obj === "object" &&
      "name" in obj &&
      "numActivePRs" in obj &&
      typeof obj.name === "string" &&
      typeof obj.numActivePRs === "number"
    );
  }

  function isFailureFetchNumPRs(obj: FetchNumPRs): obj is FailureFetchNumPRs {
    return (
      typeof obj === "object" &&
      "waitInterval" in obj &&
      "messages" in obj &&
      typeof obj.waitInterval === "number" &&
      Array.isArray(obj.messages) &&
      obj.messages.every((item: any) => typeof item === "string")
    );
  }

  // Fetch current number of PRs for given repo, using authenticated or deaunthenticated approach
  const fetchNumPRs = async (
    repo: ActiveNumPRs
  ): Promise<SucessFetchNumPRs | FailureFetchNumPRs> => {
    function handleRedirectLogic({
      response,
    }: {
      response: { status: number; url: string };
    }): void {
      function checkForRedirects({
        status,
        url,
      }: {
        status: number;
        url: string;
      }): { type: string; url: string } {
        console.log("status:", status);
        console.log("url:", url);

        let redirectionType: string = "na";

        // Handling redirection status codes - see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#follow-redirects

        if (status === 302 || status === 307) {
          // temporary redirection
          redirectionType = "temporary";
        } else if (status === 301) {
          // permanent redirection
          redirectionType = "permanent";
        }

        return {
          type: redirectionType,
          url: url,
        };
      }

      const status = response.status;
      const url = response.url;
      const redirects = checkForRedirects({ status, url });

      if (redirects.type === "temporary") {
        console.log("repeating fetchNumPRs with temporary redirect url");
        const temporaryChangedRepo = { ...repo, redirectUrl: redirects.url };
        fetchNumPRs(temporaryChangedRepo);

        return;
      } else if (redirects.type === "permanent") {
        console.log("repeating fetchNumPRs with permanent redirect url");

        const updatedActiveNumPRs = activeNumPRs;
        for (let i = 0; i < updatedActiveNumPRs.length; i++) {
          if (updatedActiveNumPRs[i].name === repoName) {
            updatedActiveNumPRs[i].redirectUrl = redirects.url;
          }
        }
        setActiveNumPRs(updatedActiveNumPRs);
        fetchNumPRs(repo);

        return;
      }
    }

    function handleRateLimitError(error: RequestError): FailureFetchNumPRs {
      // check if it was a primary or secondary rate limit error which was met
      let waitInterval: number = 0;
      const messages: string[] = [];

      if (error.response && (error.status === 403 || error.status === 429)) {
        // checking if conditions met for primary rate limit error
        if (error.response.headers["x-ratelimit-remaining"] === "0") {
          // if x-ratelimit-remaining header present, then the x-ratelimit-reset header for when safe to make another separate request must be also present
          const resetTimeEpochSeconds = Number(
            error.response.headers["x-ratelimit-reset"]
          );

          const currentTimeEpochSeconds = Math.floor(Date.now() / 1000);
          const secondsToWait = resetTimeEpochSeconds - currentTimeEpochSeconds;

          waitInterval = secondsToWait;
          messages.push(
            `Primary rate limit error, waiting ${waitInterval} seconds before making another request`
          );
        }

        // check if secondary rate limit error has occurred so timer can possibly be set for that duration (dependent on whether duration stated by 'retry-after' or 'x-ratelimit-reset' header is longer)
        if (error.response.headers["retry-after"] !== undefined) {
          const retryAfterHeaderVal: number = Number(
            error.response.headers["retry-after"]
          );
          if (retryAfterHeaderVal > waitInterval) {
            waitInterval = retryAfterHeaderVal;
          }

          messages.push(
            `Secondary rate limit error, waiting ${waitInterval} seconds before making another request`
          );
        }
      }

      return {
        waitInterval: waitInterval,
        messages: messages,
      };
    }

    const repoName = repo.name;
    const owner = repoOwner;
    const currentNumPRs = repo.numActivePRs;
    const redirectUrl = repo.redirectUrl;
    let results: any;

    // To-do: Switch out request url for authenticated and unauthenticated requests to use the one from the redirectUrl variable if present
    if (!storedPATCode) {
      // unauthenticated request

      await request(`GET /repos/${owner}/${repoName}/pulls`, {
        owner: owner,
        repo: repoName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        url: redirectUrl,
      })
        .then((response) => {
          handleRedirectLogic({ response });

          results = response.data;
        })
        .catch((error) => {
          const errorDetails = handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );

          return errorDetails;

          //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
        });
    } else {
      // authenticated request

      const requestWithAuth = request.defaults({
        headers: {
          authorization: `token ${storedPATCode}`,
        },
      });

      await requestWithAuth(`GET /repos/${owner}/${repoName}/pulls`)
        .then((response) => {
          handleRedirectLogic({ response });

          results = response.data;
        })
        .catch((error) => {
          const errorDetails = handleRateLimitError(error);

          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );

          return errorDetails;
        });
    }

    // update number of PRs for repo if number changed

    // setting a default value in case fetch request doesn't return a number (on first load of displayed tracked repos page)
    let updatedNumPRs: number = currentNumPRs ? currentNumPRs : 0;
    if (currentNumPRs !== results.length && results.length > -1) {
      updatedNumPRs = results.length;
    }

    console.log("github prs fetched:", results);

    return {
      name: repoName,
      numActivePRs: updatedNumPRs,
    };
  };

  // Sequential execution of each async call to get current number of PRs per repo
  for (const repoDetails of activeNumPRs) {
    const updatedPRDetails = await fetchNumPRs(repoDetails);

    if (isSuccessFetchNumPRs(updatedPRDetails)) {
      updatedNumPRs.push(updatedPRDetails);
    } else if (isFailureFetchNumPRs(updatedPRDetails)) {
      // return the toast messages from primary/secondary rate limit error
      // wait for specified period by primary/secondary rate limit error
      // retry the call to fetchNumPRs
    }
  }

  setActiveNumPRs(updatedNumPRs);
  saveToLocalStorage("activeNumPRs", updatedNumPRs);
}

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
      // @ts-ignore
      saveToLocalStorage("repoDetails", results);
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
      saveToLocalStorage("numPageResults", lastValidPageNumber);
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
    updatePRDetails({
      setActiveNumPRs,
      activeNumPRs,
      repoOwner,
    });
    saveToLocalStorage("activeNumPRs", activeNumPRs);
  } else {
    console.log("activeNumPRs array is empty");
  }
}

async function handleChangePageResults({
  setNumPageResults,
  setRepoDetails,
  setActiveResultsPage,
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
  setActiveResultsPage(currentResultPageNum);

  await handleSubmitUserName({
    setRepoDetails,
    setNumPageResults,
    username,
    patCode,
    currentResultPageNum,
  });

  // update current saved page number to chrome local storage after succesful fetching of details for repos on repo selection screen
  saveToLocalStorage("activeResultsPage", currentResultPageNum);
}

async function handleToggleRepo({
  name,
  newCheckedState,
  activeNumPRs,
  setActiveNumPRs,
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

  setActiveNumPRs(updatedRepoDetails);
}

async function handleToggleAllRepos({
  allReposToggled,
  repoDetails,
  setActiveNumPRs,
  setRepoDetails,
}: HandleToggleAllSelectedReposProps): Promise<void> {
  console.log("gets to here");
  const currentRepoArrDetails = repoDetails;
  let updatedOriginalRepoDetails: RepoCardComponentDetails[] = [];
  let updatedToggledRepos: ActiveNumPRs[] = [];

  console.log("allReposToggled:", allReposToggled);

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

  setRepoDetails(updatedOriginalRepoDetails);
  setActiveNumPRs(updatedToggledRepos);
}

export {
  handleFetchUserRepos,
  handleSubmitUserName,
  handleRefresh,
  handleChangePageResults,
  updatePRDetails,
  handleToggleAllRepos,
  handleToggleRepo,
};
