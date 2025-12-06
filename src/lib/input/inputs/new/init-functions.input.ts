import { getBooleanInputWithDefault } from "../../base-inputs";
import { Input } from "../../input.type";

export const getNewInitFunctionsWithDefault = (inputs: Input) => {
  return getBooleanInputWithDefault(inputs, "initFunctions", false);
};
