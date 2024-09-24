import { Input } from "@/components/ui/input";
import {
  CustomTextInputProps,
  UsernameInputProps,
  PATInputProps,
} from "@/models/TextInputModels";

const InputCustom: React.FC<CustomTextInputProps> = (props) => {
  switch (props.type) {
    case "username":
      return <UsernameInput {...props} />;
    case "PAT":
      return <PATInput {...props} />;
  }
};

const UsernameInput: React.FC<UsernameInputProps> = ({
  username,
  handleUserNameChange,
}) => {
  return (
    <Input
      className="placeholder w-full"
      type="text"
      placeholder="e.g. @rollingwolf238"
      value={username}
      onChange={(e) => handleUserNameChange(e)}
    ></Input>
  );
};

const PATInput: React.FC<PATInputProps> = ({ PAT, handlePATChange }) => {
  return (
    <Input
      className="placeholder w-full"
      type="text"
      placeholder="e.g. X62837..."
      value={PAT}
      onChange={(e) => handlePATChange(e)}
    ></Input>
  );
};

export default InputCustom;
