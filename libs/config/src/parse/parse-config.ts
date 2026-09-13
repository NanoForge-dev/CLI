import { resolveConfig } from "../merge/resolve-config";
import type { NanoforgeConfig } from "../types";
import type { DeepRequired } from "../types/utils.type";
import { loadConfigModule } from "./load-config-module";
import { assertNanoforgeConfig } from "./validate-config";

export const parseConfig = async (path: string | URL): Promise<DeepRequired<NanoforgeConfig>> => {
  const raw = await loadConfigModule(path);
  assertNanoforgeConfig(raw, String(path));
  return resolveConfig(raw);
};
