import { getStringInput, getStringInputWithDefault } from "../base-inputs";
import { type Input } from "../input.type";

export const getPathInput = (inputs: Input) => {
  return getStringInput(inputs, "path");
};

export const getPathInputWithDefault = (inputs: Input, defaultValue: string) => {
  return getStringInputWithDefault(inputs, "path", defaultValue);
};
