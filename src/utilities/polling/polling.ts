import {
  loadFromLocalStorage,
  loadFromSessionStorage,
  saveToLocalStorage,
  saveToSessionStorage,
} from "../service-worker-funcs/storage-utils.js";
import { toast } from "sonner";
import type { StartPollingProps } from "@/models/utilities/PollingUtilitiesModels.ts";
import type { SubmitPRDetailsProps } from "@/models/utilities/RepoDetailUtilitiesModels.js";
import {
  ErrorMsg,
  isErrorMsg,
  isFailureFetchNumPRs,
  isSuccessFetchNumPRs,
} from "../errorHandlingUtilities.js";
import {
  handleUpdateIndividualRepoNumPRs,
  handleUpdatePRDetailsError,
} from "./utils/pollingUtilities.js";
import { getToast } from "../toastMessages.js";
import { ActiveNumPRs } from "@/models/frontend/RepoCardModels.js";

async function updatePRDetails({
  activeNumPRs,
  repoOwner,
}: SubmitPRDetailsProps): Promise<void> {
  async function handleUpdateAllRepoNumPRs(
    activeNumPRs: ActiveNumPRs[],
    storedPATCode: string
  ) {
    try {
      for (let i = 0; i < activeNumPRs.length; i++) {
        const currentFetch = i;
        const repoDetails = activeNumPRs[currentFetch];

        await handleUpdateIndividualRepoNumPRs(
          activeNumPRs,
          repoDetails,
          repoOwner,
          currentFetch,
          storedPATCode
        );
      }
      await saveToLocalStorage("isRefreshing", false);
    } catch (e) {
      if (!isFailureFetchNumPRs(e)) {
        console.error(`Unexpected error format returned: ${e}`);
      }
      await saveToLocalStorage("isRefreshing", false);

      throw e;
    }
  }

  // Fetch current number of PRs for given repo, using authenticated or deaunthenticated approach

  try {
    const storedPATCode = (await loadFromLocalStorage("patCode")) as
      | string
      | null;
    await saveToLocalStorage("isRefreshing", true);

    if (!storedPATCode) {
      return;
    }

    // Sequential execution of each async call to get current number of PRs per repo
    await handleUpdateAllRepoNumPRs(activeNumPRs, storedPATCode);

    return;
  } catch (e) {
    console.error("Error in updatePRDetails:", e);
  }
}

async function startPolling({ activeNumPRs, repoOwner }: StartPollingProps) {
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

  async function getData() {
    const delayMs = getDelay(currentSliderValue as unknown as number);

    async function handleIfTokenExpirySoon() {
      function isWithinFourDays(inputDate: Date): Boolean {
        console.log("this is the typeof inputDate", typeof inputDate);

        const now = new Date();
        const fourDaysInMilliseconds = 4 * 24 * 60 * 60 * 1000; // 345,600,000 milliseconds

        // Calculate the absolute difference in milliseconds
        const timeDifference = Math.abs(now.getTime() - inputDate.getTime());

        // Compare the difference to the 4-day threshold
        return timeDifference <= fourDaysInMilliseconds;
      }

      const tokenExpiry = (await loadFromSessionStorage(
        "tokenExpiry"
      )) as Date | null;

      console.log(
        "tokenExpiry from session storage in handleIfTokenExpirySoon:",
        tokenExpiry
      );

      if (tokenExpiry) {
        console.log("tokenExpiry before conversion", tokenExpiry);
        const convertedTokenExpiry = new Date(tokenExpiry);
        console.log("convertedTokenExpiry", convertedTokenExpiry);
        const nearExpiry = isWithinFourDays(convertedTokenExpiry);

        if (nearExpiry) {
          const toastMessage = getToast(
            "info",
            "upcomingTokenExpiry",
            undefined,
            convertedTokenExpiry.toString()
          );
          return toast.info(toastMessage);
        }

        console.log("token expiry not within 4 days, no toast triggered");
        return;
      }
    }

    try {
      console.log(`polling github api every ${delayMs / 60000} minutes`);

      await updatePRDetails({
        activeNumPRs,
        repoOwner,
      });

      await handleIfTokenExpirySoon();

      console.log(`finished polling github api`);
    } catch (error) {
      console.error("Error during polling github api:", error);

      if (!isErrorMsg(error)) {
        console.error("Unknown error type encountered from polling:", error);
        throw new Error("polling");
      }

      await handleUpdatePRDetailsError(error);
    }
  }

  const currentSliderValue: string | null =
    await loadFromLocalStorage("pollingRate");

  // const delay = getDelay(parseInt(currentSliderValue as string));

  // initial call to get current number of open PRs across repos before commencing fetches at regular intervals
  await getData()
    .then(() => console.log(`initial call to github api complete`))
    .catch((error) => {
      console.error("Error during initial call to github api:", error);
      toast.error(
        "Error during initial call to github api, if the issue persists try reinstalling the extension"
      );
    });
}

export { startPolling, updatePRDetails };
