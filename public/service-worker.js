importScripts("locales.js");

chrome.storage.onChanged.addListener((changes, namespace) => {
  /* for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		console.log(
			`Storage key "${key}" in namespace "${namespace}" changed.`,
			`Old value was "${oldValue}", new value is "${newValue}".`
		);
	} */

  // check what the change is to activeNumPRs so I can clear polling or start polling:
  // if [] then clear polling
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "CALL_CLEAR_POLLING_FUNCTION",
      functionName: "yourFunctionName",
      params: {},
    });
  });

  // otherwise start polling
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "CALL_START_POLLING_FUNCTION",
      functionName: "yourFunctionName",
      params: {},
    });
  });
});
