import { getStringInputWithDefault } from "../base-inputs";
import { Input } from "../input.type";

export const getDirectoryInput = (inputs: Input): string => {
  return getStringInputWithDefault(inputs, "directory", ".");
};
