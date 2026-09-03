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

import { toKebabCase, toPascalCase } from "@utils/formatting";

import { type ComponentOptions } from "./component.options";
import { type ComponentSchema } from "./component.schema";

const transform = (schema: ComponentSchema): ComponentOptions => {
  return {
    part: schema.part,
    className: toPascalCase(schema.name),
    fileName: toKebabCase(schema.name),
  };
};

const generate = (options: ComponentOptions, path: string, language: "ts" | "js"): Source => {
  const rules = [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
  ];

  return apply(url(join("./files" as Path, language)), rules);
};

export const main = (schema: ComponentSchema): Rule => {
  const options = transform(schema);

  return mergeWith(generate(options, schema.directory, schema.language));
};
