import { ActiveNumPRs } from "@/models/RepoCardModels";
import { loadFromStorage, saveToStorage } from "../../public/background.ts";
import { updatePRDetails } from "./repoDetailUtilities";

const controller = new AbortController();
const signal = controller.signal;

function setPollingRateLocal(newPollingRate: number) {
  saveToStorage("pollingRate", newPollingRate);
}

function clearPolling(intervalId: NodeJS.Timeout) {
  clearInterval(intervalId);
  if (controller) {
    controller.abort();
  }
}

async function startPolling({
  setActiveNumPRs,
  activeNumPRs,
  repoOwner,
}: {
  setActiveNumPRs: React.Dispatch<React.SetStateAction<ActiveNumPRs[]>>;
  activeNumPRs: ActiveNumPRs[];
  repoOwner: string;
}): Promise<NodeJS.Timeout> {
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
        signal,
        intervalId,
      });
      console.log(`finished polling github api`);
    } catch (error) {
      // handle errors
    }
  }

  const currentSliderValue: string | null =
    await loadFromStorage("pollingRate");

  const delay = getDelay(parseInt(currentSliderValue as string));

  // initial call to get current number of open PRs across repos before commencing fetches at regular intervals
  getData().then(() => console.log(`initial call to github api complete`));

  // starting scheduled fetches
  const intervalId = setInterval(getData, delay);

  return intervalId;
}

export { clearPolling, startPolling, setPollingRateLocal };
