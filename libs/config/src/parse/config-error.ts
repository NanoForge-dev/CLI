export type ConfigParseErrorCode =
  "not-found" | "load-failed" | "no-default-export" | "invalid-type";

export class ConfigParseError extends Error {
  constructor(
    public readonly code: ConfigParseErrorCode,
    message: string,
    public readonly path: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ConfigParseError";
  }
}
