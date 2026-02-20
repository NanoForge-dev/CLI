import { red } from "ansis";

export const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return undefined;
};

export const handleActionError = (context: string, error: unknown): never => {
  console.error();
  console.error(red(context));
  const msg = getErrorMessage(error);
  if (msg) console.error(msg);
  process.exit(1);
};

export const promptError = (err: Error): never => {
  if (err.name === "ExitPromptError") {
    process.exit(1);
  }
  throw err;
};
