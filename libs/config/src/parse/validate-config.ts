import { z } from "zod";

import type { NanoforgeConfig } from "../types";
import { ConfigParseError } from "./config-error";

const buildableConfigShape = {
  entryFile: z.string().optional(),
  out: z
    .object({
      dir: z.string().optional(),
      mainFile: z.string().optional(),
    })
    .optional(),
};

const containLibConfigShape = {
  libs: z.array(z.string()).optional(),
};

const sourceableConfigShape = {
  dir: z
    .object({
      assets: z.string().optional(),
      packages: z.string().optional(),
      components: z.string().optional(),
      systems: z.string().optional(),
      scenes: z.string().optional(),
    })
    .optional(),
};

const workspaceConfigSchema = z.object({
  type: z.literal("workspace"),
  packages: z.array(z.string()).optional(),
});

const libConfigSchema = z.object({
  type: z.literal("lib"),
  dir: z
    .object({
      assets: z.string().optional(),
      shared: z.string().optional(),
      components: z.string().optional(),
      systems: z.string().optional(),
      scenes: z.string().optional(),
    })
    .optional(),
});

const clientConfigSchema = z.object({
  type: z.literal("client"),
  ...sourceableConfigShape,
  ...buildableConfigShape,
  ...containLibConfigShape,
});

const serverConfigSchema = z.object({
  type: z.literal("server"),
  ...sourceableConfigShape,
  ...buildableConfigShape,
  ...containLibConfigShape,
});

const nanoforgeConfigSchema = z.discriminatedUnion("type", [
  workspaceConfigSchema,
  libConfigSchema,
  clientConfigSchema,
  serverConfigSchema,
]);

export function assertNanoforgeConfig(
  value: unknown,
  path: string,
): asserts value is NanoforgeConfig {
  const result = nanoforgeConfigSchema.safeParse(value);

  if (!result.success) {
    throw new ConfigParseError(
      "invalid-type",
      `Config file's default export is not a valid NanoforgeConfig: ${path}\n${z.prettifyError(result.error)}`,
      path,
      { cause: result.error },
    );
  }
}
