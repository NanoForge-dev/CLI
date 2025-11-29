import { getStringInputWithDefault } from "../base-inputs";
import { Input } from "../input.type";

export const getConfigInput = (inputs: Input): string => {
  return getStringInputWithDefault(inputs, "config", ".");
};
