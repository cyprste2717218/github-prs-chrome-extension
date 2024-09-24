import { ChangeEvent } from "react";

type CustomProps = {
  type: string;
};

type TextInputProps<T = {}> = CustomProps & T;

type CustomTextInputProps =
  | (UsernameInputProps & { type: "username" })
  | (PATInputProps & { type: "PAT" });

type UsernameInputProps = TextInputProps<{
  username: string;
  handleUserNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
}>;

type PATInputProps = TextInputProps<{
  PAT: string;
  handlePATChange: (event: ChangeEvent<HTMLInputElement>) => void;
}>;

export type { CustomTextInputProps, UsernameInputProps, PATInputProps };
