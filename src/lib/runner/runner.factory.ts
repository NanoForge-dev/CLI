import { CLIError } from "@utils/errors";
import { getModulePath, resolveCLINodeBinaryPath } from "@utils/path";

import { Runner } from "./runner";

export class RunnerFactory {
  public static create(binary: string, args?: string[]): Runner {
    return new Runner(binary, args);
  }

  public static createLocal(binary: string, args?: string[]): Runner {
    return new Runner(resolveCLINodeBinaryPath(binary), args);
  }

  public static createSchematic(): Runner {
    const binaryPath = this.resolveSchematicBinary();
    return new Runner("node", [`"${binaryPath}"`]);
  }

  private static resolveSchematicBinary(): string {
    try {
      return getModulePath("@angular-devkit/schematics-cli/bin/schematics.js");
    } catch {
      throw new CLIError("'schematics' binary path could not be found!");
    }
  }
}
