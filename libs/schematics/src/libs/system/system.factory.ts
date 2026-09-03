import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  apply,
  mergeWith,
  move,
  template,
  url,
} from "@angular-devkit/schematics";

import { toCamelCase, toKebabCase } from "@utils/formatting";

import { type SystemOptions } from "./system.options";
import { type SystemSchema } from "./system.schema";

const transform = (schema: SystemSchema): SystemOptions => {
  return {
    part: schema.part,
    functionName: toCamelCase(schema.name),
    fileName: toKebabCase(schema.name),
  };
};

const generate = (options: SystemOptions, path: string, language: "ts" | "js"): Source => {
  const rules = [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
  ];

  return apply(url(join("./files" as Path, language)), rules);
};

export const main = (schema: SystemSchema): Rule => {
  const options = transform(schema);

  return mergeWith(generate(options, schema.directory, schema.language));
};
