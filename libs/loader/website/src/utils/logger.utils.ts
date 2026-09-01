type LoggerTypes = "debug" | "info" | "warn" | "error";

export class Logger {
  constructor(private readonly name: string) {}

  debug(message: string) {
    this.log("debug", message);
  }

  info(message: string) {
    this.log("info", message);
  }

  warn(message: string) {
    this.log("warn", message);
  }

  error(message: string) {
    this.log("error", message);
  }

  private log(type: LoggerTypes, message: string) {
    console[type](`${new Date().toISOString()} ${type.toUpperCase()} (${this.name}): ${message}`);
  }
}
