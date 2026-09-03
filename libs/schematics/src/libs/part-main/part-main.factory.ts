import { type Path, join, normalize, strings } from "@angular-devkit/core";
import {
  type Rule,
  type Source,
  type Tree,
  apply,
  asSource,
  mergeWith,
  move,
  template,
} from "@angular-devkit/schematics";
import * as fs from "fs";

import { generateMain } from "@utils/main/main-functions";
import { type Save, SaveLibraryTypeEnum } from "@utils/main/save.type";

import { type PartMainOptions } from "./part-main.options";
import { type PartMainSchema } from "./part-main.schema";

const transform = (schema: PartMainSchema): PartMainOptions => {
  void schema;

  return {};
};

const generate = (options: PartMainOptions, path: string, schema: PartMainSchema): Source => {
  const rules = [
    template({
      ...strings,
      ...options,
    }),
    move(normalize(path)),
  ];

  return apply(asSource(writeMain(schema, path)), rules);
};

const getMainPath = (schema: PartMainSchema): string => {
  if (schema.outFile) return schema.outFile;
  if (schema.editor)
    return join(".nanoforge/editor" as Path, schema.part, `main.${schema.language}`);
  return join(schema.part as Path, `main.${schema.language}`);
};

const writeMain = (schema: PartMainSchema, path: string) => {
  return (tree: Tree) => {
    let save = getSave(path, schema.part, schema.saveFile);

    const resPath = getMainPath(schema);

    if (schema.editor) {
      save = getEditorSave(save);
    }

    const content = generateMain(schema, save);
    fs.rmSync(join(path as Path, resPath), { force: true });
    tree.create(resPath, content);
    return tree;
  };
};

const getSave = (path: string, part: "client" | "server", saveFile?: string): Save => {
  return JSON.parse(
    fs.readFileSync(saveFile ?? join(path as Path, `.nanoforge/${part}.save.json`), "utf-8"),
  ) as Save;
};

const getEditorSave = (save: Save): Save => {
  if (save.libraries.some((lib) => lib.type === SaveLibraryTypeEnum.GRAPHICS))
    save.libraries.push({
      id: "graphicsEditorLibrary",
      type: "graphics-editor",
      name: "Graphics2DEditorLibrary",
      path: "@nanoforge-dev/graphics-2d-editor",
    });

  return save;
};

export const main = (schema: PartMainSchema): Rule => {
  const options = transform(schema);

  return mergeWith(generate(options, schema.directory, schema));
};
