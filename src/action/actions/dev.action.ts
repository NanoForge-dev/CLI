import * as ansis from "ansis";

import { type Input, getDevGenerateInput, getDirectoryInput } from "@lib/input";
import { PackageManager, PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { AbstractAction } from "../abstract.action";

export class DevAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.DEV_START);
    console.info();

    try {
      const directory = getDirectoryInput(options);
      const generate = getDevGenerateInput(options);

      await Promise.all([
        generate ? runAction("generate", [], directory, false) : undefined,
        runAction("build", [], directory, false),
        runAction("start", [], directory, true),
      ]);

      console.info(Messages.DEV_SUCCESS);
      process.exit(0);
    } catch (e) {
      console.error(Messages.DEV_FAILED);
      console.error(e);
      process.exit(1);
    }
  }
}

const runAction = async (
  command: string,
  params: string[],
  directory: string,
  stdout: boolean = false,
) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    await packageManager.runDev(directory, "nf", {}, [command, ...params, "--watch"], !stdout);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
