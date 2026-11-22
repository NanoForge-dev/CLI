import { CLIError, NoTerminalError } from "@utils/errors";

/**
 * `baseInput` when given, else the answer of `askCb`. `missing` names what to pass instead
 * (`--name`) when there is no terminal to ask in.
 */
export const getInputOrAsk = async <T>(
  baseInput: T | undefined,
  askCb: () => Promise<T>,
  missing?: string,
  defaultValue?: T,
): Promise<T> => {
  if (baseInput !== undefined) return baseInput;
  const res = await askCb().catch((error: unknown) => {
    if (error instanceof NoTerminalError && missing) throw new NoTerminalError(missing);
    throw error;
  });
  if (res !== undefined) return res;
  if (defaultValue !== undefined) return defaultValue;
  throw new CLIError("No input provided. Please provide a valid value.");
};
