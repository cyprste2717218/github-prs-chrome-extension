import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  HandleUpdateActiveNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  saveToSessionStorage,
} from "../../service-worker-funcs/storage-utils";
import {
  isFailureFetchNumPRs,
  isSuccessFetchNumPRs,
} from "@/utilities/errorHandlingUtilities";
import {
  handleCreateAlarm,
  handleDeleteAlarm,
} from "@/utilities/service-worker-funcs/alarms";
import { fetchNumPRs } from "./fetchNumPRs";
import { SubmitPRDetailsProps } from "@/models/utilities/RepoDetailUtilitiesModels";
import { toast } from "sonner";

async function rateLimitErrorHandler(e: FailureFetchNumPRs): Promise<void> {
  console.warn(
    `Rate limit error encountered on pollingAlarm alarm occurence: ${e}`
  );

  console.log("deleting polling alarm and creating rate limit error alarm");

  console.log("deleting polling alarm");
  await handleDeleteAlarm("pollingAlarm");

  console.log("creating rate limit error alarm");
  await handleCreateAlarm("rateLimitErrorAlarm");

  return;
}

async function handleUpdateAllRepoNumPRs(
  repoOwner: string,
  patCode: string | null
) {
  try {
    const activeNumPRs = (await loadFromLocalStorage(
      "activeNumPRs"
    )) as ActiveNumPRs[];

    for (let i = 0; i < activeNumPRs.length; i++) {
      const currentFetch = i;
      const repoDetails = activeNumPRs[currentFetch];

      // updating details for specific repository within tracked repository list
      await handleUpdateIndividualRepoNumPRs(
        activeNumPRs,
        repoDetails,
        repoOwner,
        currentFetch,
        patCode
      );
    }
  } catch (e) {
    if (isFailureFetchNumPRs(e)) {
      // Handling rate limit error case
      const errorToastMessages = e.toastMessages;
      const errorWaitInterval = e.waitInterval;

      if (errorToastMessages.length === 0 && errorWaitInterval === 0) {
        console.error("Error not related to rate limit has occured", e);
        return;
      } else {
        await saveToSessionStorage("waitInterval", errorWaitInterval);
        await saveToSessionStorage("messages", errorToastMessages);

        errorToastMessages.forEach((message) => {
          return toast.error(message);
        });

        // creating alarm to wait out period needed before safe to make usual polling requests again (due to meeting Github API rate limit)

        await rateLimitErrorHandler(e);

        throw e;
      }
    } else {
      console.error(`Unexpected error format returned: ${e}`);
      throw e;
    }
  }
}

const handleUpdateActiveNumPRs = async ({
  updatedPRDetails,
  repoDetails,
}: HandleUpdateActiveNumPRs): Promise<Boolean> => {
  // Creating in-memory copy of activeNumPRs for progressive mutation during incremental updates of number of active PRs per repo on display
  const activeNumPRs = (await loadFromLocalStorage(
    "activeNumPRs"
  )) as ActiveNumPRs[];
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

/* async function handleUpdatePRDetailsError(e: ErrorMsg): Promise<void> {
 

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
} */

async function handleUpdateIndividualRepoNumPRs(
  activeNumPRs: ActiveNumPRs[],
  repoDetails: ActiveNumPRs,
  repoOwner: string,
  currentFetch: number,
  storedPATCode: string | null
): Promise<Boolean> {
  async function handleSuccessFetchNumPRs(
    /* activeNumPRs: ActiveNumPRs[], */
    updatedPRDetails: SuccessFetchNumPRs,
    repoDetails: ActiveNumPRs
  ) {
    const isUpdateSuccess = await handleUpdateActiveNumPRs({
      updatedPRDetails,
      repoDetails,
    });

    if (!isUpdateSuccess) {
      const debugMessage = `Error updating new number of PRs value to storage: ${repoDetails} `;
      console.error(debugMessage);

      return false;
    }

    return true;
  }

  try {
    const updatedPRDetails = await fetchNumPRs(
      activeNumPRs,
      repoDetails,
      repoOwner,
      currentFetch,
      storedPATCode
    );

    if (isSuccessFetchNumPRs(updatedPRDetails)) {
      const result = await handleSuccessFetchNumPRs(
        updatedPRDetails,
        repoDetails
      );
      return result;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
}

function getDelay(sliderValue: number): number {
  // setting the delay based on the polling interval chosen (1,5 or 10 mins)

  let delayMs = 300000;

  if (sliderValue === 0) {
    delayMs = 600000;
  } else if (sliderValue === 50) {
    delayMs = 300000;
  } else if (sliderValue === 100) {
    delayMs = 60000;
  }

  return delayMs;
}

async function updatePRDetails({
  patCode,
  repoOwner,
}: SubmitPRDetailsProps): Promise<void> {
  try {
    // starting fetch spinner animation through localStorage update
    await saveToLocalStorage("isRefreshing", true);

    if (patCode !== null && typeof patCode !== "string") {
      console.error(
        "StoredPATCode is neither a string or null from updatePRDetails props"
      );
      throw new Error("Storage Retrieval Error");
    }

    // sequential execution of each async call to get current number of PRs per repo
    await handleUpdateAllRepoNumPRs(repoOwner, patCode);

    // stopping fetch spinner due to succesful update process
    await saveToLocalStorage("isRefreshing", false);

    return;
  } catch (e) {
    console.error("Error in updatePRDetails:", e);

    // halting fetch spinner animation in case of error
    await saveToLocalStorage("isRefreshing", false);
  }
}

export {
  getDelay,
  updatePRDetails,
  handleUpdateActiveNumPRs,
  handleUpdateIndividualRepoNumPRs,
  handleUpdateAllRepoNumPRs,
};
