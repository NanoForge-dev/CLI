import { getStringInput } from "../../base-inputs";
import { Input } from "../../input.type";

export const getNewPathInput = (inputs: Input) => {
  return getStringInput(inputs, "path");
};
