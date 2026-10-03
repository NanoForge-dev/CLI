import { getStringInput } from "@lib/input";
import { type Input } from "@lib/input";

import { InvalidCommandArgumentError } from "@utils/errors";

export type CreateType = "component" | "system" | "plugin";

export const getCreateTypeInput = (inputs: Input): CreateType => {
  const res = getStringInput(inputs, "type");
  if (res && ["component", "system", "plugin"].includes(res)) return res as CreateType;
  throw new InvalidCommandArgumentError("type", "'component', 'system' or 'plugin'");
};
