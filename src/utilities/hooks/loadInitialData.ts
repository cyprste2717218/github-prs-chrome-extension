import { loadAllFromLocalStorage } from "../service-worker-funcs/storage-utils";

async function loadInitialData(
  keysToLoad: string[]
): Promise<Record<string, unknown> | null> {
  const result = await loadAllFromLocalStorage(keysToLoad);

  if (result === null) {
    console.error("Failed to load initial data from storage.");
    return null;
  }

  console.log("Loaded initial data from storage:", result);
  return result as Record<string, unknown>;
}

export { loadInitialData };

/* chrome.storage.local.get(keysToLoad, (result) => {
			// Check for chrome.runtime.lastError in case of an issue
			if (chrome.runtime.lastError) {
				console.error("Error loading storage:", chrome.runtime.lastError);
				return null;
			}

			console.log("Loaded initial data from storage:", result);

			// Checking for empty or null string for username before parsing
			const jsonUsername = result.username;
			if (
				jsonUsername === null ||
				jsonUsername === undefined ||
				jsonUsername.trim() === ""
			) {
				console.log(
					"username value retrieved is empty or null, setting empty string manually to avoid JSON parsing error"
				);
				setUsername("");
			} else {
				setUsername(result.username);
			}

			setRepoDetails(result.repoDetails);
			setActiveNumPRs(result.activeNumPRs);
			setStep(JSON.parse(result.step));
			setPAT(result.patCode);
			setReposToggled(JSON.parse(result.reposToggled));
			setNumPageResults(JSON.parse(result.numPageResults));
			setActiveResultsPage(JSON.parse(result.activeResultsPage));
			setPollingRate(JSON.parse(result.pollingRate));

			return result;
		}); */
