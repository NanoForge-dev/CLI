import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

/** Default port of `nf editor` (the loaders use 3000). */
export const DEFAULT_EDITOR_PORT = 5173;

export const getEditorPortInput = (inputs: Input): number => {
  const raw = getStringInput(inputs, "port");
  if (raw === undefined) return DEFAULT_EDITOR_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid editor port: ${raw}`);
  }
  return port;
};
