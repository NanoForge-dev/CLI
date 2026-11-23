import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";

import { type AbstractAction } from "~/action/abstract.action";

import { NewCommand } from "./new.command";

const setup = () => {
  const run = vi.fn().mockResolvedValue(undefined);
  const program = new Command()
    .exitOverride()
    .configureOutput({ writeErr: () => undefined, writeOut: () => undefined });
  new NewCommand({ run } as unknown as AbstractAction).load(program);
  program.commands.forEach((command) => command.exitOverride());
  const parse = (...args: string[]) => program.parseAsync(["new", ...args], { from: "user" });
  return { run, program, parse };
};

describe("NewCommand", () => {
  it.each(["--init-functions", "--no-init-functions", "--no-lint"])(
    "still accepts the deprecated %s option, warns and ignores it",
    async (flag) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const { run, parse } = setup();
      await parse("--name", "demo", flag);

      expect(run).toHaveBeenCalledOnce();
      expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^Warning: .*deprecated/));
      const options = run.mock.calls[0]?.[1] as Input;
      expect(options.has("lint")).toBe(false);
      expect(options.has("initFunctions")).toBe(false);
      warn.mockRestore();
    },
  );

  it("does not warn when no deprecated option is passed", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await setup().parse("--name", "demo");

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does not list the deprecated options in the help", () => {
    const help = setup().program.commands[0]?.helpInformation() ?? "";
    expect(help).not.toContain("--init-functions");
    expect(help).not.toContain("--no-lint");
    expect(help).toContain("--no-agents");
  });

  it("still runs the action without lint or initFunctions inputs", async () => {
    const { run, parse } = setup();
    await parse("--name", "demo", "--no-server", "--skip-install", "--no-git");

    expect(run).toHaveBeenCalledOnce();
    const options = run.mock.calls[0]?.[1] as Input;
    expect(options.get("name")).toEqual({ value: "demo" });
    expect(options.get("server")).toEqual({ value: false });
    expect(options.has("lint")).toBe(false);
    expect(options.has("initFunctions")).toBe(false);
  });
});
