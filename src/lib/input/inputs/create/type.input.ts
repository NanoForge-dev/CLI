import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

export const getCreateTypeInput = (inputs: Input): "component" | "system" => {
  const res = getStringInput(inputs, "type");
  if (res && ["component", "system"].includes(res)) return res as "component" | "system";
  throw new Error("Invalid type. Please enter 'component' or 'system'.");
};
