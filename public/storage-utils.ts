async function loadFromLocalStorage<T>(key: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    chrome.storage.local.get([key], (dict: any) => {
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

async function saveToLocalStorage<T>(
  key: string,
  value: T | null
): Promise<void> {
  return new Promise<void>((resolve) => {
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
    chrome.storage.session.get([key], (dict: any) => {
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
  return new Promise<void>((resolve) => {
    // @ts-ignore
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
  loadFromSessionStorage,
  saveToSessionStorage,
};
