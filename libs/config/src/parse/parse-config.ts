import { resolveConfig } from "../merge/resolve-config";
import type { NanoforgeConfig } from "../types";
import { loadConfigModule } from "./load-config-module";
import { assertNanoforgeConfig } from "./validate-config";

export const parseConfig = async (path: string | URL): Promise<NanoforgeConfig> => {
  const raw = await loadConfigModule(path);
  assertNanoforgeConfig(raw, String(path));
  return resolveConfig(raw);
};
