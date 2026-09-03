import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  apply,
  filter,
  mergeWith,
  move,
  template,
  url,
} from "@angular-devkit/schematics";

import { type PartBaseOptions } from "./part-base.options";
import { type PartBaseSchema } from "./part-base.schema";

const transform = (schema: PartBaseSchema): PartBaseOptions => {
  return {
    part: schema.part,
    server: schema.server,
    appClass: schema.part === "client" ? "NanoforgeClient" : "NanoforgeServer",
    nanoforgeFolder: ".nanoforge",
  };
};

const generate = (
  options: PartBaseOptions,
  path: string,
  initFunctions: boolean,
  language: "ts" | "js",
): Source => {
  const rules = [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
    filter((path) => {
      const splited = path.split("/");
      return splited.at(-2) !== ".nanoforge" || splited.at(-1) === `${options.part}.save.json`;
    }),
  ];
  if (!initFunctions) rules.push(filter((path) => path.split("/").at(-2) !== "init"));

  return apply(url(join("./files" as Path, language)), rules);
};

export const main = (schema: PartBaseSchema): Rule => {
  const options = transform(schema);

  return mergeWith(generate(options, schema.directory, schema.initFunctions, schema.language));
};
