import { red } from "ansis";
import { type Ora } from "ora";

import { getSpinner } from "@lib/ui";

interface SpinnerTaskResult<T> {
  success: boolean;
  value?: T;
  error?: unknown;
}

export const withSpinner = async <T>(
  task: (spinner: Ora) => Promise<T>,
  loadingMessage: string,
  successMessage?: string,
  failureMessage?: string,
  onError?: () => void,
): Promise<SpinnerTaskResult<T>> => {
  const spinner = getSpinner(loadingMessage);
  spinner.start();

  try {
    const value = await task(spinner);
    spinner.succeed(successMessage);
    return { success: true, value };
  } catch (error: unknown) {
    spinner.fail(red(failureMessage));
    if (onError) onError();
    return { success: false, error };
  }
};
