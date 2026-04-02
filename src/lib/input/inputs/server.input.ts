import { getBooleanInputWithDefault } from "../base-inputs";
import { type Input } from "../input.type";

export function getServerInput(inputs: Input): boolean {
  return getBooleanInputWithDefault(inputs, "server", false);
}
