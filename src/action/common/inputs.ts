import { Input } from "../../command";

export const getDirectoryInput = (inputs: Input): string => {
  const directoryOption = inputs.get("directory");
  return (directoryOption && (directoryOption.value as string)) || ".";
};
