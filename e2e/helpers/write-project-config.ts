import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface WriteProjectConfigOptions {
  name: string;
  language: "ts" | "js";
  initFunctions?: boolean;
  server?: boolean;
}

/**
 * `nf new` still scaffolds a `nanoforge.config.json` (schematics is out of scope for this
 * change), but the CLI's config loader now only reads `.ts`/`.js` config modules. Tests that
 * scaffold a project and then run `build`/`generate`/`create` against it need a hand-written
 * `nanoforge.config.ts` alongside the scaffolded JSON — everything not set here falls back to
 * the CLI's own defaults, matching what the scaffolded JSON used to rely on too.
 */
export const writeProjectConfig = (
  appDir: string,
  { name, language, initFunctions = false, server = false }: WriteProjectConfigOptions,
) => {
  const content = `export default ${JSON.stringify(
    {
      name,
      language,
      initFunctions,
      client: { type: "client", enable: true },
      server: { type: "server", enable: server },
      ssl: { enable: false },
    },
    null,
    2,
  )};\n`;

  writeFileSync(join(appDir, "nanoforge.config.ts"), content);
};
