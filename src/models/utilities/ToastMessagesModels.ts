type ToastMessagesType = "success" | "error" | "info";

type ToastSuccessMessages = "savePollingRate";

type ToastWarningMessages = "rateLimitError" | "upcomingTokenExpiry";

type ToastErrorMessages =
  | "noPublicRepos"
  | "polling"
  | "storageHandling"
  | "alarmHandling"
  | "extensionInstall"
  | "changePageResults";

type ToastMessageCause =
  | ToastSuccessMessages
  | ToastWarningMessages
  | ToastErrorMessages;

type ToastMessages = {
  [key in ToastMessagesType]: {
    [key in ToastMessageCause]?: string;
  };
};

interface RetrieveToast {
  (
    category: ToastMessagesType,
    cause: ToastMessageCause,
    timeout?: number,
    expiryDateObj?: string
  ): string | void;
}

interface GetToast {
  (
    category: ToastMessagesType,
    cause: ToastMessageCause,
    timeout?: number,
    expiryDateObj?: string
  ): string;
}

export type {
  ToastMessages,
  ToastMessagesType,
  ToastMessageCause,
  GetToast,
  RetrieveToast,
};
