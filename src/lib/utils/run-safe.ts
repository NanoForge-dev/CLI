import { red } from "ansis";

import { getErrorMessage } from "@utils/errors";

export const runSafe = async <T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (msg) console.error(red(msg));
    return fallback;
  }
};
