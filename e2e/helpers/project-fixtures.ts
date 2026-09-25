import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Engine packages imported by the generated entry file are not published yet, so builds run
 * against an entry file without any dependency.
 *
 * TODO: remove once the engine v2 packages are published.
 */
export const writeStandaloneEntry = (projectDir: string, entry = "src/main.ts"): void => {
  writeFileSync(join(projectDir, entry), 'console.log("nanoforge");\n');
};
