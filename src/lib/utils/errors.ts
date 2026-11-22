import { RegistryError, type RegistryErrorCode } from "@nanoforge-dev/registry";
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
      "Run the command from a project folder, pass it with -d, or run 'nf new'.",
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
  constructor(
    detail: string,
    suggestion = "Check your nanoforge.manifest.json file for syntax or formatting errors.",
  ) {
    super(`Manifest Error: ${detail}`, suggestion);
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

/** A question was needed, but stdin is not a terminal (CI, a script, an agent): nothing can answer it. */
export class NoTerminalError extends CLIError {
  constructor(missing?: string) {
    super(
      missing
        ? `${missing} is required when not running in a terminal.`
        : "An answer is required, but stdin is not a terminal.",
      "Pass the missing options on the command line (see --help).",
    );
  }
}

/** Throws a `NoTerminalError` before a prompt that nobody could answer. */
export const assertTerminal = (): void => {
  if (!process.stdin.isTTY) throw new NoTerminalError();
};

/** Stack traces are for debugging the CLI itself: shown only with `NF_DEBUG` set. */
const isDebug = (): boolean => Boolean(process.env.NF_DEBUG);

const getErrorString = (error: Error): string => {
  const stack = isDebug() && error.stack ? error.stack : error.message;
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

const REGISTRY_SUGGESTIONS: Partial<Record<RegistryErrorCode, string>> = {
  NOT_FOUND: "Check the package name and version.",
  UNAVAILABLE: "Check your connection and try again.",
  CONFLICT: "Raise the version in nanoforge.manifest.json before publishing again.",
};

/** C0 controls but tab and newline, DEL and C1 controls, bidi overrides and isolates. */
const isControl = (code: number): boolean =>
  (code < 0x20 && code !== 0x09 && code !== 0x0a) ||
  (code >= 0x7f && code <= 0x9f) ||
  (code >= 0x202a && code <= 0x202e) ||
  (code >= 0x2066 && code <= 0x2069);

/** Registry text comes from the network: no terminal control characters. */
const printable = (text: string): string =>
  [...text].filter((char) => !isControl(char.codePointAt(0) ?? 0)).join("");

export const handleActionError = (context: string, error: unknown): never => {
  console.error();
  console.error(red(context));

  if (error instanceof CLIError || error instanceof RegistryError) {
    console.error(printable(error.message));

    const suggestion =
      error instanceof CLIError ? error.suggestion : REGISTRY_SUGGESTIONS[error.code];
    if (suggestion) {
      console.info(cyan(`\n💡 Suggestion: ${suggestion}`));
    }

    process.exit(1);
  }

  const msg = getErrorMessage(error);
  if (msg) console.error(msg);
  if (msg && !isDebug())
    console.info(cyan("\n💡 Suggestion: Run it again with NF_DEBUG=1 to see the stack trace."));
  process.exit(1);
};

export const promptError = (err: Error): never => {
  if (err.name === "ExitPromptError") {
    process.exit(1);
  }
  throw err;
};
