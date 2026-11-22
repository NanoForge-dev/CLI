import { InvalidCommandArgumentError } from "@utils/errors";

import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

/** Default port of `nf editor` (the loaders use 3000). */
export const DEFAULT_EDITOR_PORT = 5173;

/** A TCP port, from 1 to 65535. */
export const parsePort = (raw: string): number => {
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || port < 1 || port > 65535) {
    throw new InvalidCommandArgumentError("port", `an integer from 1 to 65535, got '${raw}'`);
  }
  return port;
};

export const getEditorPortInput = (inputs: Input): number => {
  const raw = getStringInput(inputs, "port");
  return raw === undefined ? DEFAULT_EDITOR_PORT : parsePort(raw);
};
