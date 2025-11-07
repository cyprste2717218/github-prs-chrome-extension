import { useEffect } from "react";
import { saveAllToLocalStorage } from "../service-worker-funcs/storage-utils";

/**
 * Custom hook to sync multiple state values to Chrome's local storage.
 * @param {object} syncMap - An object where keys are storage keys and values are state values to sync.
 * * Example: useChromeStorageSync({ patCode: PAT, username: username, step: step });
 */
export const useChromeStorageSync = (syncMap: object) => {
  // Use a single useEffect hook to handle all necessary synchronizations.
  // This hook will re-run whenever any value in the syncMap object changes.

  console.log("syncMap in useChromeStorageSync:", syncMap);
  useEffect(() => {
    const dataToSave = syncMap;

    if (Object.keys(dataToSave).length > 0) {
      saveAllToLocalStorage(dataToSave);
    }

    // The dependency array is the array of values from the syncMap object.
    // This tells React to re-run the effect ONLY when one of the synced state values changes.
  }, [Object.values(syncMap)]);
};
