import { Input } from "../../../command";
import { getStringInputWithDefault } from "./base-inputs";

export const getDirectoryInput = (inputs: Input): string => {
  return getStringInputWithDefault(inputs, "directory", ".");
};
