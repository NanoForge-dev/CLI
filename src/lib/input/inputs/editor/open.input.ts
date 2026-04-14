import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getEditorOpenInput = (inputs: Input, defaultValue: boolean): boolean => {
  return getBooleanInputWithDefault(inputs, "open", defaultValue);
};
