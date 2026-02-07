import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getNewPathInput = (inputs: Input) => {
  return getStringInput(inputs, "path");
};
