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

import { toKebabCase } from "@utils/formatting";
import { fetchTrustedVersion } from "@utils/registry";

import {
  DEFAULT_APP_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_NANOFORGE_DEPENDENCY_VERSION,
  DEFAULT_PACKAGE_MANAGER,
} from "~/defaults";

import { type ProjectOptions } from "./project.options";
import { type ProjectSchema } from "./project.schema";

interface DepVersions {
  ecs: string;
  graphics2d: string;
  input: string;
  network: string;
  nanoforge: string;
}

const resolveDepVersions = async (part: ProjectSchema["part"]): Promise<DepVersions> => {
  const isClient = part === "client";

  const [nanoforge, ecs, network, graphics2d, input] = await Promise.all([
    fetchTrustedVersion("nanoforge", DEFAULT_NANOFORGE_DEPENDENCY_VERSION),
    fetchTrustedVersion("@nanoforge-dev/ecs", DEFAULT_NANOFORGE_DEPENDENCY_VERSION),
    fetchTrustedVersion("@nanoforge-dev/network", DEFAULT_NANOFORGE_DEPENDENCY_VERSION),
    isClient
      ? fetchTrustedVersion("@nanoforge-dev/graphics-2d", DEFAULT_NANOFORGE_DEPENDENCY_VERSION)
      : DEFAULT_NANOFORGE_DEPENDENCY_VERSION,
    isClient
      ? fetchTrustedVersion("@nanoforge-dev/input", DEFAULT_NANOFORGE_DEPENDENCY_VERSION)
      : DEFAULT_NANOFORGE_DEPENDENCY_VERSION,
  ]);

  return {
    ecs,
    graphics2d,
    input,
    network,
    nanoforge,
  };
};

const transform = async (schema: ProjectSchema): Promise<ProjectOptions> => {
  const packageManager = schema.packageManager ?? DEFAULT_PACKAGE_MANAGER;
  const workspace = schema.workspace ?? true;
  const depVersions = await resolveDepVersions(schema.part);

  return {
    part: schema.part,
    appClass: schema.part === "client" ? "NanoforgeClient" : "NanoforgeServer",
    packageName: `${toKebabCase(schema.workspaceName ?? DEFAULT_APP_NAME)}-${schema.part}`,
    language: schema.language ?? DEFAULT_LANGUAGE,
    strict: schema.strict ?? true,
    packageManager,
    workspace,
    ecsVersion: depVersions.ecs,
    graphics2dVersion: depVersions.graphics2d,
    inputVersion: depVersions.input,
    networkVersion: depVersions.network,
    nanoforgeVersion: depVersions.nanoforge,
    initFunctions: schema.initFunctions ?? false,
    hasServer: schema.hasServer ?? false,
    docker: schema.docker ?? false,
    editor: schema.editor ?? false,
    libs: schema.libs ?? [],
    allowBuilds: workspace ? [] : (schema.allowBuilds ?? []),
  };
};

const generate = (options: ProjectOptions, path: string): Source => {
  return apply(url(join("./files" as Path, options.language)), [
    template({
      dot: ".",
      ...strings,
      ...options,
    }),
    filter(
      (path) =>
        (options.docker && !options.workspace) ||
        !["Dockerfile", ".dockerignore"].includes(path.split("/").at(-1) ?? ""),
    ),
    filter(
      (path) =>
        (options.packageManager === "pnpm" && options.allowBuilds.length > 0) ||
        !(path.split("/").at(-1) ?? "").startsWith("pnpm-workspace.yaml"),
    ),
    filter((path) => {
      const filename = path.split("/").at(-1) ?? "";
      if (
        filename.startsWith("drawable-circle-2d.component") ||
        filename.startsWith("draw-2d.system")
      ) {
        return options.part === "client";
      }
      if (filename.startsWith("move-2d.system")) {
        return options.part === "server";
      }
      if (filename.startsWith("position-sync.system")) {
        return options.part === "client" && options.hasServer;
      }
      return true;
    }),
    renameTemplateFiles(),
    move(normalize(path)),
  ]);
};

export const main = (schema: ProjectSchema): Rule => {
  return async () => {
    const options = await transform(schema);

    return mergeWith(generate(options, schema.directory));
  };
};
