import { getBooleanInputWithDefault } from "../base-inputs";
import { type Input } from "../input.type";

export const getEditorInput = (inputs: Input): boolean => {
  return getBooleanInputWithDefault(inputs, "editor", false);
};
