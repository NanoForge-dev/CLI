import { getStringInput, getStringInputWithDefault } from "../base-inputs";
import { Input } from "../input.type";

export function getDirectoryInput(inputs: Input): string;
export function getDirectoryInput(inputs: Input, withDefault: false): string | undefined;
export function getDirectoryInput(inputs: Input, withDefault = true): string | undefined {
  if (withDefault) return getStringInputWithDefault(inputs, "directory", ".");
  return getStringInput(inputs, "directory");
}
