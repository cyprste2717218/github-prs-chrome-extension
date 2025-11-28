import { ActiveNumPRs } from "@/models/frontend/RepoCardModels";
import {
  FailureFetchNumPRs,
  HandleUpdateActiveNumPRs,
  SuccessFetchNumPRs,
} from "@/models/utilities/ServiceWorkerFuncsModels";
import {
  loadFromLocalStorage,
  loadFromSessionStorage,
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

async function networkErrorAlarmHandler(e: FailureFetchNumPRs): Promise<void> {
  console.log("deleting polling alarm and creating network error alarm:", e);

  console.log("deleting polling alarm");
  await handleDeleteAlarm("pollingAlarm");

  console.log("creating network error alarm");
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

    return true;
  } catch (e) {
    if (isFailureFetchNumPRs(e)) {
      // Handling rate limit or network error cases
      const errorType = e.type;
      const errorToastMessages = e.toastMessages;
      const errorWaitInterval = e.waitInterval;

      if (
        errorToastMessages.length === 0 &&
        errorWaitInterval === 0 &&
        errorType === ""
      ) {
        console.error("Error not related to rate limit has occured", e);
        return false;
      } else {
        const milisecondsErrorWaitInterval = errorWaitInterval * 60000;
        console.log(
          "milisecondErrorWaitInterval:",
          milisecondsErrorWaitInterval
        );

        await saveToSessionStorage(
          "waitInterval",
          milisecondsErrorWaitInterval
        );
        await saveToSessionStorage("messages", errorToastMessages);

        const retrievedWaitInterval =
          await loadFromSessionStorage("waitInterval");
        console.log(
          "wait interval from session storage after having saved it:",
          retrievedWaitInterval
        );

        // creating alarm to wait out period needed before safe to make usual polling requests again (due to meeting Github API rate limit or waiting before worth retrying network requests)
        try {
          if (errorType === "rateLimit") {
            await rateLimitErrorHandler(e);
          } else if (errorType === "networkError") {
            await networkErrorAlarmHandler(e);
          }
        } catch (e) {
          console.error(
            "Alarm handling error during handleUpdateAllRepoNumPRS func"
          );
        }

        // display any error toasts
        errorToastMessages.forEach((message) => {
          return toast.error(message);
        });

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

    // display toast messages for any warnings returned (i.e. nearing primary rate limit)

    const warningMessages: string[] = updatedPRDetails.toastMessages;

    if (warningMessages.length > 0) {
      warningMessages.forEach((message) => {
        return toast.warning(message);
      });
    }

    return true;
  }
  return false;
};

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

async function getDelay(sliderValue: number): Promise<number> {
  // Converting slider value to ms equivalent

  // checking storage to see if PAT is null, if so setting delay to 30min equivalent in ms (to help avoid meeting rate limit in authenticated fetches)
  const patCode = await loadFromLocalStorage("patCode");
  if (patCode === null) {
    return 1800000;
  }

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
    const successfulPollingUpdate = await handleUpdateAllRepoNumPRs(
      repoOwner,
      patCode
    );
    if (!successfulPollingUpdate) {
      throw new Error();
    }

    // stopping fetch spinner due to succesful update process
    await saveToLocalStorage("isRefreshing", false);

    // updating date/time of last succesful update
    const currentDate = new Date();
    await saveToLocalStorage("lastUpdated", currentDate.toUTCString());

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
