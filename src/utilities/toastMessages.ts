import type {
  GetToast,
  ToastMessages,
} from "@/models/utilities/ToastMessagesModels";

const toastMessages: ToastMessages = {
  success: {
    savePollingRate: "New polling rate saved successfully!",
  },
  info: {},
  error: {
    noPublicRepos: "No public repositories discovered for specified user",
    polling:
      "Error during polling github api, if the issue persists try reinstalling the extension",
    storageHandling:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
    alarmHandling:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
    extensionInstall:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
  },
};

const getToast: GetToast = (category, cause, timeout) => {
  if (timeout) {
    if (category === "info" && cause === "rateLimitError") {
      return `You've hit a rate limit! Waiting ${timeout} seconds before trying again`;
    } else {
      console.error(
        "Invalid parameters passed to getToast function with timeout"
      );
      return;
    }
  }

  return toastMessages[category][cause];
};

export { getToast };
