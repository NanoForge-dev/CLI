import { type Path, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  apply,
  mergeWith,
  move,
  template,
  url,
} from "@angular-devkit/schematics";

import { DEFAULT_PACKAGE_MANAGER } from "~/defaults";

import { type DockerOptions } from "./docker.options";
import { type DockerSchema } from "./docker.schema";

const transform = (schema: DockerSchema): DockerOptions => {
  return {
    packageManager: schema.packageManager ?? DEFAULT_PACKAGE_MANAGER,
  };
};

const generate = (options: DockerOptions, path: string): Source => {
  return apply(url("./files" as Path), [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
  ]);
};

export const main = (schema: DockerSchema): Rule => {
  const options = transform(schema);
  return mergeWith(generate(options, schema.directory));
};
