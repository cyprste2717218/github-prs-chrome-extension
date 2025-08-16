import React from "react";
import type {
  RepoCardComponentDetails,
  ActiveNumPRs,
} from "../models/RepoCardModels";
import { request } from "@octokit/request";
import { loadFromStorage, saveToStorage } from "../../public/background.ts";
import { clearPolling } from "./pollingUtilities.ts";

type RepoDetailUtilities = {
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  patCode: string | null;
  currentResultPageNum?: number;
};

type SubmitPRDetailsProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
  signal: AbortSignal;
  intervalId: NodeJS.Timeout;
};

type HandleRefreshProps = {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  activeNumPRs: ActiveNumPRs[];
  currentStep: number;
  repoOwner: string;
  signal: AbortSignal;
  intervalId: NodeJS.Timeout;
};

type HandleChangePageResultsProps = {
  setNumPageResults: React.Dispatch<React.SetStateAction<number>>;
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveResultsPage: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  patCode: string | null;
  currentResultPageNum: number;
};

type HandleToggleSingleRepoProps = {
  name: string;
  newCheckedState: boolean;
  activeNumPRs: ActiveNumPRs[];
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
};

type HandleToggleAllSelectedReposProps = {
  setRepoDetails: React.Dispatch<
    React.SetStateAction<RepoCardComponentDetails[] | null>
  >;
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  repoDetails: RepoCardComponentDetails[];
  activeNumPRs: ActiveNumPRs[];
  allReposToggled: boolean;
};

async function updatePRDetails({
  setActiveNumPRs,
  activeNumPRs,
  repoOwner,
  intervalId,
  signal,
}: SubmitPRDetailsProps) {
  console.log("gets to here");
  console.log("active num of prs:", activeNumPRs);
  const storedPATCode = await loadFromStorage("patCode");
  let updatedNumPRs: ActiveNumPRs[] = [];

  if (signal.aborted) {
    clearPolling(intervalId);
  }

  signal.addEventListener("abort", () => {
    clearPolling(intervalId);
  });

  // Fetch current number of PRs for given repo, using authenticated or deaunthenticated approach
  const fetchNumPRs = async (repo: ActiveNumPRs) => {
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

    const repoName = repo.name;
    const owner = repoOwner;
    const currentNumPRs = repo.numActivePRs;
    const redirectUrl = repo.redirectUrl;
    let results: any;

    // Check periodically for abort signal
    if (signal.aborted) {
      clearPolling(intervalId);
    }

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
          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );
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
          console.log(
            `error fetching number of PRs for repo ${repoName}: ${error}`
          );
          //To-Do: get implementation of shadcn/ui Sonner (banner)component to display if error fetching updated num prs for repo
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

  // Determining whether or not to create promises for repo details fetching in sequential or parallel fashion, in order to avoid meeting secondary rate limit of the Github REST API on too many concurrent requests. See https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits

  if (activeNumPRs.length > 30) {
    // Sequential execution of each async call to get current number of PRs per repo
    for (const repoDetails of activeNumPRs) {
      const updatedPRDetails = await fetchNumPRs(repoDetails);
      updatedNumPRs.push(updatedPRDetails);
    }
  } else {
    // Parallel execution of each async call to get current number of PRs per repo
    updatedNumPRs = await Promise.all(
      activeNumPRs.map((repoDetails) => fetchNumPRs(repoDetails))
    );
  }

  setActiveNumPRs(updatedNumPRs);
  saveToStorage("activeNumPRs", updatedNumPRs);
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
      return;
    }
    setRepoDetails(results);
    // @ts-ignore
    saveToStorage("repoDetails", results);
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
  intervalId,
  signal,
}: HandleRefreshProps) {
  if (activeNumPRs.length !== 0) {
    console.log("activeNumPRs array is not empty");
    updatePRDetails({
      setActiveNumPRs,
      activeNumPRs,
      repoOwner,
      intervalId,
      signal,
    });
    saveToStorage("activeNumPRs", activeNumPRs);
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
  saveToStorage("activeResultsPage", currentResultPageNum);
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
