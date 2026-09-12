import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  apply,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  template,
  url,
} from "@angular-devkit/schematics";

import { fetchTrustedVersions } from "@utils/registry";

import {
  DEFAULT_CLI_DEPENDENCY_VERSION,
  DEFAULT_ENGINE_VERSION,
  DEFAULT_PACKAGE_MANAGER,
  DEFAULT_TYPESCRIPT_VERSION,
} from "~/defaults";

import { type WorkspaceOptions } from "./workspace.options";
import { type WorkspaceSchema } from "./workspace.schema";

/**
 * bun ships as a postinstall-driven binary download (its own package.json
 * declares `"postinstall": "node install.js"`), and @nanoforge-dev/cli
 * depends on it unconditionally, so every generated workspace needs it
 * approved to run its build script regardless of what the caller passes.
 */
const ALWAYS_ALLOWED_BUILDS = ["bun"];

const transform = async (schema: WorkspaceSchema): Promise<WorkspaceOptions> => {
  const packageManager = schema.packageManager ?? DEFAULT_PACKAGE_MANAGER;

  const versions = await fetchTrustedVersions({
    "@nanoforge-dev/cli": { fallback: DEFAULT_CLI_DEPENDENCY_VERSION },
    nanoforge: { fallback: DEFAULT_ENGINE_VERSION },
    typescript: { fallback: DEFAULT_TYPESCRIPT_VERSION, major: 6 },
  });

  return {
    name: schema.name,
    engineVersion: versions.nanoforge,
    cliVersion: versions["@nanoforge-dev/cli"],
    typescriptVersion: versions.typescript,
    language: schema.language,
    strict: schema.strict,
    packageManager,
    allowBuilds: Array.from(new Set([...ALWAYS_ALLOWED_BUILDS, ...(schema.allowBuilds ?? [])])),
    docker: schema.docker ?? false,
  };
};

const generate = (options: WorkspaceOptions, path: string): Source => {
  return apply(url(join("./files" as Path, options.language)), [
    template({
      dot: ".",
      ...strings,
      ...options,
    }),
    filter(
      (path) =>
        options.packageManager === "pnpm" ||
        !(path.split("/").at(-1) ?? "").startsWith("pnpm-workspace.yaml"),
    ),
    filter(
      (path) =>
        options.docker || !["Dockerfile", ".dockerignore"].includes(path.split("/").at(-1) ?? ""),
    ),
    renameTemplateFiles(),
    move(normalize(path)),
  ]);
};

export const main = (schema: WorkspaceSchema): Rule => {
  return async () => {
    const options = await transform(schema);
    const path = schema.directory ?? options.name;

    return mergeWith(generate(options, path));
  };
};
