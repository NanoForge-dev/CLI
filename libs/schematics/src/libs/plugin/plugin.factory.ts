import { normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  SchematicsException,
  type Source,
  apply,
  mergeWith,
  move,
  renameTemplateFiles,
  template,
  url,
} from "@angular-devkit/schematics";

import { toCamelCase } from "@utils/formatting";
import { fetchTrustedVersions } from "@utils/registry";

import { DEFAULT_EDITOR_VERSION } from "~/defaults";

import { type PluginOptions } from "./plugin.options";
import { type PluginSchema } from "./plugin.schema";

const PLUGIN_NAME_PATTERN = /^@([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)$/;

const transform = async (schema: PluginSchema): Promise<PluginOptions> => {
  const name = schema.name.trim();
  const short = PLUGIN_NAME_PATTERN.exec(name)?.[2];
  if (!short) {
    throw new SchematicsException(
      `"${name}" is not a plugin name. Use @scope/name, in lowercase: @acme/counter.`,
    );
  }

  const versions = await fetchTrustedVersions({
    "@nanoforge-dev/editor-sdk": { fallback: DEFAULT_EDITOR_VERSION, major: 1 },
    "@nanoforge-dev/editor-vite-plugin": { fallback: DEFAULT_EDITOR_VERSION, major: 1 },
  });

  return {
    name,
    short,
    title: short
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    id: toCamelCase(short),
    editorSdkVersion: versions["@nanoforge-dev/editor-sdk"],
    editorVitePluginVersion: versions["@nanoforge-dev/editor-vite-plugin"],
  };
};

const generate = (options: PluginOptions, path: string): Source => {
  return apply(url("./files"), [
    template({
      dot: ".",
      ...strings,
      ...options,
    }),
    renameTemplateFiles(),
    move(normalize(path)),
  ]);
};

export const main = (schema: PluginSchema): Rule => {
  return async () => {
    const options = await transform(schema);

    return mergeWith(generate(options, schema.directory ?? options.short));
  };
};
