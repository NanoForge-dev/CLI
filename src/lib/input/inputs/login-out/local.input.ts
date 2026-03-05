import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export function getLocalInput(inputs: Input): boolean {
  return getBooleanInputWithDefault(inputs, "local", false);
}
