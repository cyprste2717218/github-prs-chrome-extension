import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";

const ToastMessages = ({
  networkErrorMsg,
  miscErrorMsgs,
}: {
  networkErrorMsg?: string;
  miscErrorMsgs?: string[];
}) => {
  const messages: string[] = [];
  const renderedMessages: React.ReactNode[] = [];

  if (networkErrorMsg) {
    messages.push(networkErrorMsg);
  }

  if (miscErrorMsgs && miscErrorMsgs.length > 0) {
    messages.push(...miscErrorMsgs);
  }

  messages.forEach((msg) => {
    renderedMessages.push(<Fragment>{toast.error(msg)}</Fragment>);
  });

  return renderedMessages.map((msg, index) => (
    <Fragment key={index}>{msg}</Fragment>
  ));
};

export default ToastMessages;
