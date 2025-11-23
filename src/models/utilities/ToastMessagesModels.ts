type ToastMessagesType = "success" | "error" | "info";

type ToastSuccessMessages = "savePollingRate";

type ToastWarningMessages = "rateLimitError";

type ToastErrorMessages =
  | "noPublicRepos"
  | "polling"
  | "storageHandling"
  | "alarmHandling"
  | "extensionInstall";

type ToastMessageCause =
  | ToastSuccessMessages
  | ToastWarningMessages
  | ToastErrorMessages;

type ToastMessages = {
  [key in ToastMessagesType]: {
    [key in ToastMessageCause]?: string;
  };
};

interface GetToast {
  (
    category: ToastMessagesType,
    cause: ToastMessageCause,
    timeout?: number
  ): string | void;
}

export type { ToastMessages, ToastMessagesType, ToastMessageCause, GetToast };
