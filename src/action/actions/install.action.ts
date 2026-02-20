import { type Input, getDirectoryInput, getInstallNamesInputOrAsk } from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class InstallAction extends AbstractAction {
  protected startMessage = Messages.INSTALL_START;
  protected successMessage = Messages.INSTALL_SUCCESS;
  protected failureMessage = Messages.INSTALL_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const names = await getInstallNamesInputOrAsk(args);
    const directory = getDirectoryInput(options);

    const packageManager = await PackageManagerFactory.find(directory);
    const success = await packageManager.addProduction(directory, names);

    return { success };
  }
}
