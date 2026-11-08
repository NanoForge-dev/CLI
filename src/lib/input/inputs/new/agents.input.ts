import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getNewAgentsInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "agents", true);
};
