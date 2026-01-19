import { getBooleanInputWithDefault } from "../base-inputs";
import { Input } from "../input.type";

export const getWatchInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "watch", false);
};
