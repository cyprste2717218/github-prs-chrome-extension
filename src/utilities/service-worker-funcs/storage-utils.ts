async function checkForRunTimeError(context?: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const lastError = chrome.runtime.lastError;
    if (lastError) {
      console.error(
        `
        Runtime error: ${lastError.message}
        ${context ? `Additional info: ${context}` : ""}
        `
      );
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

async function loadFromLocalStorage<T>(key: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    chrome.storage.local.get([key], async (dict: any) => {
      // 1). Check for runtime error prior to indexing attempt
      const isRuntimeError = await checkForRunTimeError(
        "Error loading from storage"
      );
      if (isRuntimeError) {
        return;
      }

      // 2). Check if chrome local storage object exists before index attempt
      const retrievedDict = await dict;

      if (!retrievedDict) {
        return;
      }

      let result;

      try {
        // Check if key exists in local storage object
        if (retrievedDict[key] === undefined) {
          throw new Error(
            `No value retrieved, key '${key}' not found in localStorage`
          );
        } else {
          result = JSON.parse(retrievedDict[key]);
        }
      } catch (e) {
        throw new Error(`Error parsing data from localStorage: ${e}`);
      }

      console.log(
        `Loaded from localStorage key: ${key}, value: `,
        result,
        typeof result
      );
      resolve(result);
    });
  });
}

async function loadAllFromLocalStorage<T>(
  storageKeys: string[]
): Promise<T | null> {
  return new Promise<T | null>(async (resolve) => {
    async function fetchAllData(storageKeys: string[]): Promise<T> {
      const retrievedData: any = new Object();

      for (const key of storageKeys) {
        const retrievedValue = await loadFromLocalStorage(key);
        retrievedData[key] = retrievedValue;
        console.log("retrieved data so far:", retrievedData);
      }

      return retrievedData;
    }

    try {
      const allRetrievedData = await fetchAllData(storageKeys);

      if (!allRetrievedData) {
        resolve(null);
      } else {
        const isRetrievedDataEmpty = Object.keys(allRetrievedData).length === 0;
        console.log(
          "is retrieved data empty:",
          isRetrievedDataEmpty,
          "retrieved data:",
          allRetrievedData
        );
        resolve(!isRetrievedDataEmpty ? (allRetrievedData as T) : null);
      }
    } catch (e) {
      console.error(
        "Error loading all specified entries from localStorage:",
        e
      );
    }
  });
}

async function saveAllToLocalStorage(data: object): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const storageKeys = Object.keys(data);
      storageKeys.forEach(async (key: string) => {
        const value = (data as any)[key];
        await saveToLocalStorage(key, value);
      });

      console.log("All specified entries saved to localStorage successfully.");
    } catch (e) {
      console.error("Error saving all specified entries to localStorage:", e);
    }
    resolve();
  });
}

async function saveToLocalStorage<T>(
  key: string,
  value: T | null
): Promise<void> {
  return new Promise<void>(async (resolve) => {
    const isRuntimeError = await checkForRunTimeError(
      "Error saving individual entry to localStorage"
    );
    if (isRuntimeError) {
      return;
    }

    //console.log(`Saving to localStorage key: ${ key }, value: `, value);
    chrome.storage.local.set(
      {
        [key]: JSON.stringify(value),
      },
      resolve
    );
  });
}

async function loadFromSessionStorage<T>(key: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    chrome.storage.session.get([key], async (dict: any) => {
      const isRuntimeError = await checkForRunTimeError(
        "Error loading from session storage"
      );
      if (isRuntimeError) {
        return null;
      }

      let result;
      try {
        result = JSON.parse(dict[key]);
      } catch (e) {
        result = dict[key];
      }
      resolve(result || null);
    });
  });
}

async function saveToSessionStorage<T>(
  key: string,
  value: T | null
): Promise<void> {
  return new Promise<void>(async (resolve) => {
    const isRuntimeError = await checkForRunTimeError(
      "Error saving to session storage"
    );
    if (isRuntimeError) {
      return;
    }

    chrome.storage.session.set(
      {
        [key]: JSON.stringify(value),
      },
      resolve
    );
  });
}

export {
  loadFromLocalStorage,
  loadAllFromLocalStorage,
  saveToLocalStorage,
  saveAllToLocalStorage,
  loadFromSessionStorage,
  saveToSessionStorage,
};
