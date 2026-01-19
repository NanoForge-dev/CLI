import { getBooleanInputWithDefault } from "../../base-inputs";
import { Input } from "../../input.type";

export const getDevGenerateInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "generate", false);
};
