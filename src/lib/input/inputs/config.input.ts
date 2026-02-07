import { getStringInputWithDefault } from "../base-inputs";
import { type Input } from "../input.type";

export const getConfigInput = (inputs: Input): string => {
  return getStringInputWithDefault(inputs, "config", ".");
};
