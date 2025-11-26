import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import {
  checkUpcomingTokenExpiry,
  handleRedirectLogic,
  handleRetrieval,
} from "./fetchNumPRsUtils";

const fetchNumPRs = async (
  activeNumPRs: ActiveNumPRs[],
  repo: ActiveNumPRs,
  repoOwner: string,
  currentFetch: number,
  storedPATCode: string | null
): Promise<SuccessFetchNumPRs | FailureFetchNumPRs> => {
  try {
    const warningMessages: string[] = [];
    const repoName = repo.name;
    const currentNumPRs = repo.numActivePRs;

    // 1). Get results from call to Github REST API `repos` resource, retrieving all pull request details for a specified repository and return them
    const response = await handleRetrieval(
      repo,
      repoOwner,
      repoName,
      storedPATCode
    );

    if (!response) {
      throw new Error("Polling Error");
    }

    // 2). Extract headers, data payload, status and url fields from response
    const responseHeaders = response.headers;
    const responseData = response.data;
    const responseStatus = response.status;
    const responseUrl = response.url;

    console.log("results from fetch:", responseData);

    // 3). Check for temporary or permanent redirects, if present repeating call to fetchNumPRs with new redirectURL
    const updatedPRDetailsWithRedirect = await handleRedirectLogic({
      repo,
      repoName,
      activeNumPRs,
      responseStatus,
      responseUrl,
    });
    if (updatedPRDetailsWithRedirect) {
      await fetchNumPRs(
        activeNumPRs,
        updatedPRDetailsWithRedirect,
        repoOwner,
        currentFetch,
        storedPATCode
      );
    }

    // 4). Check if nearing primary or secondary rate limits, if so return to user
    // TO-DO IMPLEMENT THIS FUNCTIONALITY

    // 5). Check if nearing PAT token expiry (if one supplied), if so flag to user
    const upcomingExpiryMessage = checkUpcomingTokenExpiry(
      responseHeaders,
      currentFetch,
      activeNumPRs
    );
    if (upcomingExpiryMessage) {
      warningMessages.push(upcomingExpiryMessage);
    }

    // 6). Update number of PRs for repo if number changed
    let updatedNumPRs: number = currentNumPRs ? currentNumPRs : 0;
    if (currentNumPRs !== responseData.length && responseData.length > -1) {
      updatedNumPRs = responseData.length;
    }

    const FetchNumPRsReturnObj: SuccessFetchNumPRs = {
      name: repoName,
      numActivePRs: updatedNumPRs,
      toastMessages: warningMessages,
    };

    console.log("github prs fetched:", responseData);

    return FetchNumPRsReturnObj;
  } catch (e) {
    console.error("Error in fetchNumPRs:", e);
    throw e;
  }
};

export { fetchNumPRs };
