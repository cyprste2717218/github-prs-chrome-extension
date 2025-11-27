import { toast } from "sonner";
import { loadFromSessionStorage, saveAllToLocalStorage } from "./storage-utils";

async function handleExtensionInstall(): Promise<void> {
  console.log("GitHub PR Tracker Extension installed or updated!");

  const initialSettings = {
    step: 1, // Initial step set to 1
    username: "", // Initial empty username
    pollingRate: 50, // Default polling rate
    reposToggled: false, // Default state for all repos selected or not on selection screen
    numPageResults: 0, // Default number of repo result pages
    activeResultsPage: 1, // Default page number,
    patCode: null, // Initial null PAT,
    repoDetails: null, // Initial null value regarding repository details tracked
    activeNumPRs: [], // Initial empty array for active PRs
    isRefreshing: false, // Initial not refreshing state
    lastUpdated: "",
  };

  await saveAllToLocalStorage(initialSettings)
    .then(() => {
      console.log("Initial settings saved to local storage successfully!");
      return;
    })
    .catch((error) => {
      console.error(`Error saving initial settings to local storage: ${error}`);

      throw new Error("Storage Handling Error encountered");
    });
}

async function handleSessionStorageChanges(
  changes: { [key: string]: chrome.storage.StorageChange },
  area: string
): Promise<any> {
  if (area === "session" && changes.messages) {
    const messages: string[] | null = await loadFromSessionStorage("messages");
    if (!messages) {
      return;
    }

    for (const msg in messages) {
      return toast.error(msg);
    }
  }
}

export { handleExtensionInstall, handleSessionStorageChanges };
