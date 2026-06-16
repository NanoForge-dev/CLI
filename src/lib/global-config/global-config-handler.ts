import { read, readUserConfig, write, writeUserConfig } from "rc9";

import { GLOBAL_CONFIG_FILE_NAME } from "@lib/constants";
import { type DeepPartial } from "@lib/types";

import { deepMerge, isEmpty } from "@utils/object";

import { GLOBAL_CONFIG_DEFAULTS } from "./global-config-defaults";
import { type GlobalConfig } from "./global-config.type";

type CReader = (options: { name: string; dir?: string }) => GlobalConfig;

export class GlobalConfigHandler {
  static read(dir?: string): GlobalConfig {
    const dirConfig = this._readConfig(read, false, dir);
    if (dirConfig) return dirConfig;
    const cwdConfig = this._readConfig(read, false, process.cwd());
    if (cwdConfig) return cwdConfig;
    return this._readConfig(readUserConfig, true);
  }

  static write(config: DeepPartial<GlobalConfig>, local: boolean = false, dir?: string): void {
    const options = {
      name: GLOBAL_CONFIG_FILE_NAME,
      dir,
    };
    if (local) write(config, options);
    else writeUserConfig(config, options);
  }

  private static _readConfig(func: CReader, force: true): GlobalConfig;
  private static _readConfig(func: CReader, force?: false, dir?: string): GlobalConfig | null;
  private static _readConfig(func: CReader, force?: boolean, dir?: string): GlobalConfig | null {
    const res = func({
      name: GLOBAL_CONFIG_FILE_NAME,
      dir,
    });
    if (!force) {
      if (isEmpty(res)) return null;
    }
    return deepMerge(GLOBAL_CONFIG_DEFAULTS, res);
  }
}
