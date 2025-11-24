import type {
  GetToast,
  RetrieveToast,
  ToastMessages,
} from "@/models/utilities/ToastMessagesModels";

const toastMessages: ToastMessages = {
  success: {
    savePollingRate: "New polling rate saved successfully!",
  },
  info: {
    rateLimitError: "You've hit a rate limit! Try again later",
    noPublicRepos: "No public repositories discovered for specified user",
  },
  error: {
    polling:
      "Error during polling github api, if the issue persists try reinstalling the extension",
    storageHandling:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
    alarmHandling:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
    extensionInstall:
      "An error has occurred, try reloading or alternatively reinstalling the extension",
    changePageResults:
      "An error occurred while changing page results, please try again",
  },
};

const retrieveToast: RetrieveToast = (category, cause, timeout) => {
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

const getToast: GetToast = (category, cause, timeout): string => {
  const toastMessage = retrieveToast(category, cause, timeout);
  if (!toastMessage) {
    console.error(
      `No toast message found for ${cause} error, returning generic error message for use in toast`
    );
    return "An error has occured";
  }

  return toastMessage;
};

export { getToast };
