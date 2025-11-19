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
      resolve(result || null);
    });
  });
}

async function saveAllToLocalStorage(data: object): Promise<void> {
  return new Promise<void>(async () => {
    const isRuntimeError = await checkForRunTimeError(
      "Error saving all entries to localStorage"
    );
    if (isRuntimeError) {
      return null;
    }

    chrome.storage.local.set(data);
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
      return null;
    }

    chrome.storage.local.set(
      {
        [key]: value,
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
      return null;
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
  saveToLocalStorage,
  saveAllToLocalStorage,
  loadFromSessionStorage,
  saveToSessionStorage,
};
