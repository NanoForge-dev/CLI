import { InvalidCommandArgumentError, InvalidConfigValueError } from "@utils/errors";

import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

/** Default port of `nf editor` (the loaders use 3000). */
export const DEFAULT_EDITOR_PORT = 5173;

const PORT_RANGE = "an integer from 1 to 65535";

const toPort = (raw: string): number | undefined => {
  const port = Number(raw);
  return /^\d+$/.test(raw) && port >= 1 && port <= 65535 ? port : undefined;
};

/** A TCP port, from 1 to 65535. */
export const parsePort = (raw: string): number => {
  const port = toPort(raw);
  if (port === undefined) {
    throw new InvalidCommandArgumentError("port", `${PORT_RANGE}, got '${raw}'`);
  }
  return port;
};

export const getEditorPortInput = (inputs: Input): number => {
  const raw = getStringInput(inputs, "port");
  return raw === undefined ? DEFAULT_EDITOR_PORT : parsePort(raw);
};

/**
 * `--port` of `nf start`, or the config's port, checked before anything starts. A bad config
 * port names the config file: there is no argument to fix.
 */
export const getPortInputWithDefault = (inputs: Input, configPort: string): string => {
  const raw = getStringInput(inputs, "port");
  if (raw !== undefined) return String(parsePort(raw));
  const port = toPort(configPort);
  if (port === undefined) {
    throw new InvalidConfigValueError("port", `${PORT_RANGE}, got '${configPort}'`);
  }
  return String(port);
};
