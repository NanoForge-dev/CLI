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
    "rejects the removed %s option",
    async (flag) => {
      const { run, parse } = setup();
      await expect(parse("--name", "demo", flag)).rejects.toMatchObject({
        code: "commander.unknownOption",
      });
      expect(run).not.toHaveBeenCalled();
    },
  );

  it("does not list the removed options in the help", () => {
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
