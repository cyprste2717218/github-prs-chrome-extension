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
      const isRuntimeError = await checkForRunTimeError(
        "Error loading from storage"
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
      resolve(result);
    });
  });
}

async function loadAllFromLocalStorage<T>(
  storageKeys: string[]
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    try {
      const retrievedData: any = new Object();
      storageKeys.forEach(async (key) => {
        await loadFromLocalStorage(key).then((retrievedValue: any) => {
          retrievedData[key] = retrievedValue;
        });
      });

      resolve(retrievedData as T);
    } catch (e) {
      console.error(
        "Error loading all specified entries from localStorage:",
        e
      );
      resolve(null);
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
