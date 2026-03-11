import { join } from "path";

import {
  type Input,
  getDirectoryInput,
  getInstallLibInput,
  getInstallNamesInputOrAsk,
  getInstallServerInput,
} from "@lib/input";
import { resolveManifestDependencies } from "@lib/manifest/manifest-resolver";
import { PackageManagerFactory } from "@lib/package-manager";
import { Registry } from "@lib/registry";
import { Messages } from "@lib/ui";

import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class InstallAction extends AbstractAction {
  protected startMessage = Messages.INSTALL_START;
  protected successMessage = Messages.INSTALL_SUCCESS;
  protected failureMessage = Messages.INSTALL_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const names = await getInstallNamesInputOrAsk(args);
    const directory = getDirectoryInput(options);
    const isLib = getInstallLibInput(options);
    const isServer = getInstallServerInput(options);

    return isLib
      ? this._installLibs(directory, names)
      : this._installNfPackages(directory, names, isServer);
  }

  private async _installLibs(directory: string, names: string[]): Promise<HandleResult> {
    const packageManager = await PackageManagerFactory.find(directory);
    return { success: await packageManager.addDevelopment(directory, names) };
  }

  private async _installNfPackages(
    directory: string,
    names: string[],
    isServer?: boolean,
  ): Promise<HandleResult> {
    const deps = await resolveManifestDependencies(names, directory);

    const libSuccess = await this._installLibs(
      directory,
      deps.npm.map(([name, version]) => `${name}@${version}`),
    );

    if (!libSuccess) return { success: false };

    return withSpinner(Messages.INSTALL_PACKAGES_IN_PROGRESS, async () => {
      await Registry.install(
        Object.values(deps.nf),
        join(directory, isServer ? "server" : "client"),
      );
    });
  }
}
