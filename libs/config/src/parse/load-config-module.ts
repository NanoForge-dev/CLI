import { access } from "node:fs/promises";

import { ConfigParseError } from "./config-error";

export const loadConfigModule = async (path: string | URL): Promise<unknown> => {
  const pathLabel = String(path);

  try {
    await access(path);
  } catch (cause) {
    throw new ConfigParseError("not-found", `Config file not found: ${pathLabel}`, pathLabel, {
      cause,
    });
  }

  let module: { default?: unknown };
  try {
    const { unrun } = await import("unrun");
    ({ module } = await unrun<{ default?: unknown }>({ path, preset: "bundle-require" }));
  } catch (cause) {
    throw new ConfigParseError(
      "load-failed",
      `Failed to load config file: ${pathLabel}`,
      pathLabel,
      { cause },
    );
  }

  if (module.default === undefined) {
    throw new ConfigParseError(
      "no-default-export",
      `Config file has no default export: ${pathLabel}`,
      pathLabel,
    );
  }

  return module.default;
};
