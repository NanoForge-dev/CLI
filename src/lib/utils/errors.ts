import { red } from "ansis";

export class CLIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigNotFoundError extends CLIError {
  constructor(configPath: string) {
    super(
      `Configuration file not found at path: ${configPath}. Please run 'nf new' or provide a valid --config path.`,
    );
  }
}

export class BuildError extends CLIError {
  constructor(details: string) {
    super(`Build failed: ${details}`);
  }
}

export class InvalidCommandArgumentError extends CLIError {
  constructor(argName: string, expected: string) {
    super(`Invalid argument '${argName}'. Expected: ${expected}.`);
  }
}

export class RegistryAuthenticationError extends CLIError {
  constructor() {
    super("You must be logged in to perform this action. Run 'nf login'.");
  }
}

export class ProjectInitializationError extends CLIError {
  constructor(details: string) {
    super(`Failed to create new project: ${details}`);
  }
}

const getErrorString = (error: Error): string => {
  const stack = error.stack ? error.stack : error.message;
  const cause =
    error.cause && typeof error.cause === "object"
      ? JSON.stringify(error.cause, null, 2)
      : error.cause;
  return `${stack}${cause ? `\n${cause}` : ""}`;
};

export const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return getErrorString(error);
  if (typeof error === "string") return error;
  return undefined;
};

export const handleActionError = (context: string, error: unknown): never => {
  console.error();
  console.error(red(context));
  if (error instanceof CLIError) {
    console.error(error.message);
    process.exit(1);
  }
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
