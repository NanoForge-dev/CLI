import { getModulePath } from "@utils/path";

import { AbstractRunner } from "../abstract.runner";

export class SchematicRunner extends AbstractRunner {
  public static getModulePaths() {
    return module.paths;
  }

  public static findClosestSchematicsBinary(): string {
    try {
      return getModulePath("@angular-devkit/schematics-cli/bin/schematics.js");
    } catch (e) {
      console.error(e);
      throw new Error("'schematics' binary path could not be found!");
    }
  }

  constructor() {
    super(`node`, [`"${SchematicRunner.findClosestSchematicsBinary()}"`]);
  }
}
