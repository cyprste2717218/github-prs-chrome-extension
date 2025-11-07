import { useEffect } from "react";

/**
 * Hook to listen for Chrome storage changes and update React state
 * @param storageKey - The key to listen for changes
 * @param setState - State setter function to update when storage changes
 */
export const useChromeStorageListener = <T>(
  storageKey: string,
  setState: (value: T) => void
) => {
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area === "local" && changes[storageKey]) {
        setState(changes[storageKey].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [storageKey, setState]);
};
