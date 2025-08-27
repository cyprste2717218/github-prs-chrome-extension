import { loadFromStorage, saveToStorage } from "../../public/background.ts";
import { updatePRDetails } from "./repoDetailUtilities";
import { toast } from "sonner";
import { StartPollingProps } from "@/models/utilities/PollingUtilitiesModels.ts";

const controller = new AbortController();

async function setPollingRateLocal(newPollingRate: number) {
  await saveToStorage("pollingRate", newPollingRate);
}

function clearPolling(intervalId: NodeJS.Timeout) {
  console.log("clearing polling interval");
  clearInterval(intervalId);
  if (controller) {
    controller.abort();
  }
}

async function startPolling({
  setActiveNumPRs,
  setIntervalId,
  activeNumPRs,
  repoOwner,
}: StartPollingProps) {
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

    try {
      console.log(`polling github api every ${delayMs / 60000} minutes`);
      await updatePRDetails({
        setActiveNumPRs,
        activeNumPRs,
        repoOwner,
      });
      console.log(`finished polling github api`);
    } catch (error) {
      console.error("Error during polling github api:", error);
      toast.error(
        "Error during polling github api, if the issue persists try reinstalling the extension"
      );
    }
  }

  const currentSliderValue: string | null =
    await loadFromStorage("pollingRate");

  const delay = getDelay(parseInt(currentSliderValue as string));

  // initial call to get current number of open PRs across repos before commencing fetches at regular intervals
  await getData().then(() =>
    console.log(`initial call to github api complete`)
  );

  // starting scheduled fetches
  const newIntervalId = setInterval(getData, delay);

  // save interval ID to React state and chrome local storage
  () => setIntervalId(newIntervalId);
  saveToStorage("intervalId", newIntervalId);
}

export { clearPolling, startPolling, setPollingRateLocal };
