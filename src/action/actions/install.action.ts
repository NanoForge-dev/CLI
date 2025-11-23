import * as ansis from "ansis";
import * as process from "node:process";

import { Input, getDirectoryInput, getInstallNamesInputOrAsk } from "@lib/input";
import { PackageManager, PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { AbstractAction } from "../abstract.action";

export class InstallAction extends AbstractAction {
  public async handle(args: Input, options: Input) {
    console.info(Messages.INSTALL_START);
    console.info();

    try {
      const names = await getInstallNamesInputOrAsk(args);
      const directory = getDirectoryInput(options);

      await installPackages(names, directory);

      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

const installPackages = async (names: string[], directory: string) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    await packageManager.addProduction(directory, names);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
