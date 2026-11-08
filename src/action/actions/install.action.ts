import { ProjectPackages } from "@nanoforge-dev/registry";

import {
  type Input,
  getArrayInput,
  getDirectoryInput,
  getInstallLibInput,
  getInstallNamesInputOrAsk,
} from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";
import { createRegistry } from "@lib/registry";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";
import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

/** `@scope/name@^1.2.0` → `["@scope/name", "^1.2.0"]`; no range after the name → undefined. */
export const parsePackageSpec = (spec: string): [string, string | undefined] => {
  const at = spec.lastIndexOf("@");
  return at > 0 ? [spec.slice(0, at), spec.slice(at + 1) || undefined] : [spec, undefined];
};

export class InstallAction extends AbstractAction {
  protected startMessage = Messages.INSTALL_START;
  protected successMessage = Messages.INSTALL_SUCCESS;
  protected failureMessage = Messages.INSTALL_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);

    return getInstallLibInput(options)
      ? this._installLibs(directory, await getInstallNamesInputOrAsk(args))
      : this._installNfPackages(directory, getArrayInput(args, "names") ?? []);
  }

  private async _installLibs(directory: string, names: string[]): Promise<HandleResult> {
    const packageManager = await PackageManagerFactory.find(directory);
    return { success: await packageManager.addDevelopment(directory, names) };
  }

  /**
   * Installs registry packages into `nf_modules` (list, lock and tsconfig paths updated). Without
   * names, installs what the lock lists (a fresh clone).
   */
  private _installNfPackages(directory: string, names: string[]): Promise<HandleResult> {
    const packages = new ProjectPackages(getCwd(directory), createRegistry());
    return withSpinner(async () => {
      if (!names.length) {
        await packages.restore();
        return;
      }
      for (const spec of names) await packages.install(...parsePackageSpec(spec));
    }, Messages.INSTALL_PACKAGES_IN_PROGRESS);
  }
}
