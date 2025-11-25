import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  HandleUpdateActiveNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import {
  saveToLocalStorage,
  saveToSessionStorage,
} from "../../service-worker-funcs/storage-utils";
import {
  ErrorMsg,
  isErrorMsg,
  isFailureFetchNumPRs,
  isSuccessFetchNumPRs,
} from "@/utilities/errorHandlingUtilities";
import {
  handleCreateAlarm,
  handleDeleteAlarm,
} from "@/utilities/service-worker-funcs/alarms";
import { fetchNumPRs } from "./fetchNumPRs";

function checkTokenExpiry(headers: any): string | undefined {
  try {
    const expirationDate = headers["github-authentication-token-expiration"];

    if (expirationDate) {
      console.log(`Token expires on: ${expirationDate}`);
      return expirationDate as string;
    }
  } catch (e) {
    console.log("Token expiration header not found.");
    return;
  }
}

const handleUpdateActiveNumPRs = async ({
  activeNumPRs,
  updatedPRDetails,
  repoDetails,
}: HandleUpdateActiveNumPRs): Promise<Boolean> => {
  // Creating in-memory copy of activeNumPRs for progressive mutation during incremental updates of number of active PRs per repo on display
  const activeNumPRsCopy: ActiveNumPRs[] = [...activeNumPRs];

  const targetIndex = activeNumPRs.findIndex(
    (repo: ActiveNumPRs) => updatedPRDetails.name === repo.name
  );

  if (targetIndex !== -1) {
    // Create a NEW object (immutable update) for the target index
    activeNumPRsCopy[targetIndex] = {
      ...repoDetails, // Copy existing properties of the target object
      numActivePRs: updatedPRDetails.numActivePRs, // Apply the new property value
    };
    console.log("activeNumPRsCopy:", activeNumPRsCopy);
    await saveToLocalStorage("activeNumPRs", activeNumPRsCopy);
    return true;
  }
  return false;
};

async function handleUpdatePRDetailsError(e: ErrorMsg): Promise<void> {
  async function rateLimitErrorHandler(
    timeout: number,
    message: string,
    e: ErrorMsg
  ): Promise<void> {
    console.warn(
      `Rate limit error encountered on pollingAlarm alarm occurence: ${e}`
    );

    console.log("deleting polling alarm and creating rate limit error alarm");

    console.log("deleting polling alarm");
    await handleDeleteAlarm("pollingAlarm");

    console.log("creating rate limit error alarm");
    await handleCreateAlarm("rateLimitErrorAlarm");

    throw {
      customType: message,
      waitInterval: timeout,
    };
  }

  let message;
  let timeout: number;

  if (!isErrorMsg(e)) {
    console.error(
      "Unknown error type encountered from execution of updatePRDetails func:",
      e
    );
    throw new Error("polling");
  }

  message = e.customType;
  timeout = e.waitInterval as number;

  try {
    if (message === "Storage Handling Error encountered") {
      console.error(`Error saving to chrome localStorage: ${e}`);

      throw { customType: message };
    } else if (message === "Rate Limit Error encountered") {
      await rateLimitErrorHandler(timeout, message, e);
    }
  } catch (e) {
    if (!isErrorMsg(e)) {
      return;
    }
    console.log(
      "Error during error handling process for handling polling alarm:",
      e.customType
    );

    message = "Alarm handling error encountered";
    throw { customType: message };
  }
}

async function handleUpdateIndividualRepoNumPRs(
  activeNumPRs: ActiveNumPRs[],
  repoDetails: ActiveNumPRs,
  repoOwner: string,
  currentFetch: number,
  storedPATCode: string
) {
  async function handleSuccessFetchNumPRs(
    activeNumPRs: ActiveNumPRs[],
    updatedPRDetails: SuccessFetchNumPRs,
    repoDetails: ActiveNumPRs
  ) {
    const isUpdateSuccess = handleUpdateActiveNumPRs({
      activeNumPRs,
      updatedPRDetails,
      repoDetails,
    });

    if (!isUpdateSuccess) {
      const debugMessage = `Error updating new number of PRs value to storage: ${repoDetails} `;
      errorMsg.customType = "Storage Handling Error encountered";

      console.error(debugMessage);

      throw errorMsg;
    }

    if (updatedPRDetails.expiry) {
      console.log("Token expiry detected:", updatedPRDetails.expiry);
      await saveToSessionStorage("tokenExpiry", updatedPRDetails.expiry);
    }
  }

  async function handleFailureFetchNumPRs(
    updatedPRDetails: FailureFetchNumPRs
  ) {
    const debugMessage = `Rate Limit Error during fetching updated number of PRs, waiting for ${updatedPRDetails.waitInterval} seconds: ${repoDetails} `;

    errorMsg.customType = "Rate Limit Error encountered";
    errorMsg.waitInterval = updatedPRDetails.waitInterval;

    await saveToSessionStorage("waitInterval", updatedPRDetails.waitInterval);
    await saveToSessionStorage("messages", updatedPRDetails.messages);

    console.warn(debugMessage);

    throw errorMsg;
  }

  const updatedPRDetails = await fetchNumPRs(
    activeNumPRs,
    repoDetails,
    repoOwner,
    currentFetch,
    storedPATCode
  );
  console.log(`fetched repoDetails`);

  if (isSuccessFetchNumPRs(updatedPRDetails)) {
    handleSuccessFetchNumPRs(activeNumPRs, updatedPRDetails, repoDetails);
  } else if (isFailureFetchNumPRs(updatedPRDetails)) {
    handleFailureFetchNumPRs(updatedPRDetails);
  }
}

export {
  checkTokenExpiry,
  handleUpdateActiveNumPRs,
  handleUpdatePRDetailsError,
  handleUpdateIndividualRepoNumPRs,
};
