import { getStringInput } from "@lib/input";
import { type Input } from "@lib/input";

import { InvalidCommandArgumentError } from "@utils/errors";

export const getCreateTypeInput = (inputs: Input): "component" | "system" => {
  const res = getStringInput(inputs, "type");
  if (res && ["component", "system"].includes(res)) return res as "component" | "system";
  throw new InvalidCommandArgumentError("type", "'component' or 'system'");
};
