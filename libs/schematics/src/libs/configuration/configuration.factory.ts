import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  type Tree,
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  template,
  url,
} from "@angular-devkit/schematics";

import { ConfigDeclarator } from "@utils/config/config.declarator";
import { ConfigFinder } from "@utils/config/config.finder";
import { type Config } from "@utils/config/config.type";
import { type DeepPartial } from "@utils/types";

import { type ConfigurationOptions } from "./configuration.options";
import { type ConfigurationSchema } from "./configuration.schema";

const transform = (schema: ConfigurationSchema): ConfigurationOptions => {
  void schema;

  return {};
};

const generate = (options: ConfigurationOptions, path: string): Source => {
  return apply(url(join("./files" as Path)), [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
  ]);
};

const addConfiguration = (options: DeepPartial<Config>, path: Path) => {
  return (tree: Tree) => {
    const config = new ConfigFinder(tree).find(path);
    if (!config) return tree;

    const content = tree.read(config)?.toString();
    const declarator = new ConfigDeclarator();

    if (!content) return tree;

    tree.overwrite(config, declarator.declare(content, options));
    return tree;
  };
};

const getConfig = (schema: ConfigurationSchema): DeepPartial<Config> => {
  const res: DeepPartial<Config> = {
    name: schema.name,
    language: schema.language,
    client: {
      enable: true,
    },
    server: {
      enable: schema.server ?? false,
    },
  };

  if (schema.initFunctions) {
    res["initFunctions"] = true;
  }

  if (schema.language === "js") {
    if ("client" in res && res.client) {
      res.client["build"] = { entry: "client/main.js" };
      res.client["editor"] = { entry: ".nanoforge/editor/client/main.js" };
    }
    if (schema.server && "server" in res && res.server) {
      res.server["build"] = { entry: "server/main.js" };
      res.server["editor"] = { entry: ".nanoforge/editor/client/main.js" };
    }
  }

  return res;
};

export const main = (schema: ConfigurationSchema): Rule => {
  const options = transform(schema);
  const directory = schema.directory;

  return branchAndMerge(
    chain([
      mergeWith(generate(options, directory)),
      addConfiguration(getConfig(schema), directory as Path),
    ]),
  );
};
