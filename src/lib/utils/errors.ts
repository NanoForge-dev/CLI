import { red } from "ansis";

export const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return getErrorString(error);
  if (typeof error === "string") return error;
  return undefined;
};

const getErrorString = (error: Error): string => {
  const stack = error.stack ? error.stack : error.message;
  const cause =
    error.cause && typeof error.cause === "object"
      ? JSON.stringify(error.cause, null, 2)
      : error.cause;
  return `${stack}${cause ? `\n${cause}` : ""}`;
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
