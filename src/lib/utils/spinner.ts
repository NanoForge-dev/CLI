import { type Ora } from "ora";

import { getSpinner } from "@lib/ui";

interface SpinnerTaskResult<T> {
  success: boolean;
  value?: T;
  error?: unknown;
}

export const withSpinner = async <T>(
  message: string,
  task: (spinner: Ora) => Promise<T>,
  onError?: () => void,
): Promise<SpinnerTaskResult<T>> => {
  const spinner = getSpinner(message);
  spinner.start();

  try {
    const value = await task(spinner);
    spinner.succeed();
    return { success: true, value };
  } catch (error: unknown) {
    spinner.fail();
    if (onError) onError();
    return { success: false, error };
  }
};
