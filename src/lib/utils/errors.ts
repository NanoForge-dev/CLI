import { cyan, red } from "ansis";

export class CLIError extends Error {
  public readonly suggestion?: string;

  constructor(message: string, suggestion?: string) {
    super(message);
    this.name = this.constructor.name;
    this.suggestion = suggestion;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigNotFoundError extends CLIError {
  constructor(configPath: string) {
    super(
      `Configuration file not found at path: ${configPath}.`,
      "Please run 'nf new' or provide a valid --config path.",
    );
  }
}

export class BuildError extends CLIError {
  constructor(details: string) {
    super(
      `Build failed: ${details}`,
      "Check the logs above for syntax errors or configuration issues.",
    );
  }
}

export class InvalidCommandArgumentError extends CLIError {
  constructor(argName: string, expected: string) {
    super(
      `Invalid argument '${argName}'. Expected: ${expected}.`,
      "Verify the command syntax using the --help flag.",
    );
  }
}

export class RegistryAuthenticationError extends CLIError {
  constructor() {
    super("You must be logged in to perform this action.", "Run 'nf login' to authenticate.");
  }
}

export class ProjectInitializationError extends CLIError {
  constructor(details: string) {
    super(
      `Failed to create new project: ${details}`,
      "Verify your permissions and that the target directory is empty.",
    );
  }
}

export class ManifestError extends CLIError {
  constructor(detail: string) {
    super(
      `Manifest Error: ${detail}`,
      "Check your nanoforge.manifest.json file for syntax or formatting errors.",
    );
  }
}

export class FileSystemError extends CLIError {
  constructor(action: string, targetPath: string) {
    super(
      `File System Error [${action}]: ${targetPath}`,
      "Verify your file permissions and ensure the path exists.",
    );
  }
}

export class ApiRequestError extends CLIError {
  constructor(status: number, cause?: unknown) {
    const causeStr = cause && typeof cause === "object" ? JSON.stringify(cause, null, 2) : cause;
    super(
      `API Request failed (Status ${status})${causeStr ? `\nDetails: ${causeStr}` : ""}`,
      "Check your network connection, API key, or the registry status.",
    );
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

    if (error.suggestion) {
      console.info(cyan(`\n💡 Suggestion: ${error.suggestion}`));
    }

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
