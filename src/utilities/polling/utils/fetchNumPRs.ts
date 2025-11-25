import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import { checkTokenExpiry } from "./pollingUtilities";
import {
  FailureFetchNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import { isFailureFetchNumPRs } from "@/utilities/errorHandlingUtilities";
import { handleRetrieval } from "./fetchNumPRsUtils";

const fetchNumPRs = async (
  activeNumPRs: ActiveNumPRs[],
  repo: ActiveNumPRs,
  repoOwner: string,
  currentFetch: number,
  storedPATCode: string
): Promise<SuccessFetchNumPRs | FailureFetchNumPRs> => {
  const repoName = repo.name;
  const owner = repoOwner;
  const currentNumPRs = repo.numActivePRs;
  const redirectUrl = repo.redirectUrl;

  let results: any;

  await handleRetrieval(owner, repoName, storedPATCode, currentFetch);

  if (!results) {
    throw new Error("");
  }
  const resultsHeaders = results.headers;
  const resultsData = results.data;

  // update number of PRs for repo if number changed

  // setting a default value in case fetch request doesn't return a number (on first load of displayed tracked repos page)

  console.log("results from fetch:", resultsData);

  if (isFailureFetchNumPRs(resultsData)) {
    return resultsData;
  }
  let updatedNumPRs: number = currentNumPRs ? currentNumPRs : 0;
  if (currentNumPRs !== resultsData.length && resultsData.length > -1) {
    updatedNumPRs = resultsData.length;
  }

  const FetchNumPRsReturnObj: SuccessFetchNumPRs = {
    name: repoName,
    numActivePRs: updatedNumPRs,
    expiry: null,
  };

  // check if current personal access token expiry is coming soon (if response header returned for the request) to flag to user
  const lastFetch = currentFetch === activeNumPRs.length - 1;
  //console.log("is last fetch:", lastFetch);

  if (lastFetch) {
    console.log("on lastfetch so checking following headers", resultsHeaders);
    const tokenExpiry = checkTokenExpiry(resultsHeaders);

    if (tokenExpiry) {
      console.log(`Token expiry date: ${tokenExpiry}`);

      const isoString = tokenExpiry.replace(" ", "T").replace(" UTC", "Z");

      const expiryDateObj = new Date(isoString);
      FetchNumPRsReturnObj["expiry"] = expiryDateObj;
    }
  }

  console.log("github prs fetched:", resultsData);

  return FetchNumPRsReturnObj;
};

export { fetchNumPRs };
