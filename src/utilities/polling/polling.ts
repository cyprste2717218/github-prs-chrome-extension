import { toast } from "sonner";
import type { StartPollingProps } from "@/models/utilities/PollingUtilitiesModels.ts";
import { getDelay, updatePRDetails } from "./utils/pollingUtilities.js";

async function makePollingCall(patCode: string | null, repoOwner: string) {
  // making scheduled polling calls to Github REST API to check for update in number of PRS for tracked repositories

  try {
    await updatePRDetails({ patCode, repoOwner });
  } catch (e) {
    console.error("Unexpected error thrown:", e);
  }
}

async function startPolling({
  currentSliderValue,
  repoOwner,
  patCode,
}: StartPollingProps) {
  // initial call to get current number of open PRs across repos before commencing fetches at regular intervals

  try {
    // convert polling rate from miliseconds to minutes for info console.log
    const delayMs = getDelay(currentSliderValue);
    console.log(`polling github api every ${delayMs / 60000} minutes`);

    await makePollingCall(patCode, repoOwner);

    console.log(`initial call to github api complete`);
  } catch (e) {
    console.error("Error during initial call to github api:", e);

    return toast.error(
      "Error during initial call to github api, if the issue persists try reinstalling the extension"
    );
  }
}

export { startPolling, makePollingCall };
