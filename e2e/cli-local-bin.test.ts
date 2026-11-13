import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const project = resolve(__dirname, "../.tmp-e2e-local-bin");

// A project with its own CLI installed: nf loads that CLI's command loader instead of its own (#123).
describe("nf inside a project with a local CLI", () => {
  beforeAll(() => {
    const localCli = join(project, "node_modules", "@nanoforge-dev", "cli");
    mkdirSync(join(localCli, "dist"), { recursive: true });
    writeFileSync(join(localCli, "package.json"), JSON.stringify({ type: "module" }));
    writeFileSync(
      join(localCli, "dist", "command.loader.js"),
      `export const CommandLoader = {
  load: async (program) => {
    program.command("local-marker").description("command of the local cli");
  },
};
`,
    );
  });

  afterAll(() => {
    rmSync(project, { recursive: true, force: true });
  });

  it("should load the commands of the local CLI", async () => {
    const { stdout, stderr, exitCode } = await runCli(["--help"], { cwd: project });

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("local-marker");
  });
});
