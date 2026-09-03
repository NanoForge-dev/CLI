import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type SchematicContext,
  type Source,
  type Tree,
  apply,
  mergeWith,
  move,
  renameTemplateFiles,
  template,
  url,
} from "@angular-devkit/schematics";
import { firstValueFrom } from "rxjs";

import {
  DEFAULT_APP_NAME,
  DEFAULT_AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_LANGUAGE,
  DEFAULT_PACKAGE_MANAGER,
  DEFAULT_VERSION,
} from "~/defaults";

import { type ApplicationOptions } from "./application.options";
import { type ApplicationSchema } from "./application.schema";

const transform = (schema: ApplicationSchema): ApplicationOptions => {
  return {
    name: schema.name ?? DEFAULT_APP_NAME,
    version: schema.version ?? DEFAULT_VERSION,
    author: schema.author ?? DEFAULT_AUTHOR,
    description: schema.description ?? DEFAULT_DESCRIPTION,
    language: schema.language ?? DEFAULT_LANGUAGE,
    strict: schema.strict ?? true,
    lint: schema.lint ?? true,
    packageManager: schema.packageManager ?? DEFAULT_PACKAGE_MANAGER,
    server: schema.server ?? false,
    editor: schema.editor ?? false,
    initFunctions: schema.initFunctions ?? false,
  };
};

const generate = (options: ApplicationOptions, path: string): Source => {
  return apply(url(join("./files" as Path, options.language)), [
    template({
      dot: ".",
      ...strings,
      ...options,
    }),
    renameTemplateFiles(),
    move(normalize(path)),
  ]);
};

export const main = (schema: ApplicationSchema): Rule => {
  const options = transform(schema);
  const path = schema.directory ?? options.name;

  return async (baseTree: Tree, context: SchematicContext) => {
    let tree = await mergeWith(generate(options, path))(baseTree, context);
    if (!tree) return tree;
    if (!("delete" in tree)) {
      if (typeof tree === "function") return tree;
      tree = await firstValueFrom(tree);
    }

    const basePath = join("/" as Path, path);

    if (!options.lint) {
      tree.delete(join(basePath, "eslint.config.js"));
      tree.delete(join(basePath, "prettier.config.js"));
      tree.delete(join(basePath, ".prettierignore"));
      if (options.language === "js") tree.delete(join(basePath, "jsconfig.json"));
    }

    if (!options.server) {
      tree.delete(join(basePath, ".env"));
    }

    if (options.packageManager !== "pnpm") {
      tree.delete(join(basePath, "pnpm-workspace.yaml"));
    }

    return tree;
  };
};
