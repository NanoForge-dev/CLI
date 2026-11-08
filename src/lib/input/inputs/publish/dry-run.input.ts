import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getDryRunInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "dryRun", false);
};
