import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getNewLintInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "lint", true);
};
