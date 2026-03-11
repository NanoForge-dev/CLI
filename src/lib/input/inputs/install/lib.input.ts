import { getBooleanInputWithDefault } from "../../base-inputs";
import { type Input } from "../../input.type";

export function getInstallLibInput(inputs: Input): boolean {
  return getBooleanInputWithDefault(inputs, "lib", false);
}
