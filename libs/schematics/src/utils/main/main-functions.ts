import { join } from "path";

import { InitFunctionEnum } from "@utils/main/enums";

import { MainGenerator } from "./main.generator";
import { type Save } from "./save.type";

export interface MainOptions {
  part: "client" | "server";
  language: "js" | "ts";
  initFunctions: boolean;
  editor: boolean;
  outFile?: string;
}

export const generateMain = (options: MainOptions, save: Save) => {
  const isServer = options.part === "server";
  const hasTypes = options.language === "ts";
  const initFunctions = options.initFunctions;

  return (
    !options.editor
      ? new MainGenerator()
      : new MainGenerator(
          true,
          join(
            "../".repeat(options.outFile ? options.outFile.split("/").length - 1 : 3),
            options.part,
          ),
        )
  )
    .generateBaseImports(hasTypes)
    .generateLibsImports(save.libraries)
    .generateInitFunctionsImportsIfNeeded(initFunctions)
    .generateComponentsImports(save.components)
    .generateSystemsImports(save.systems)

    .generateMainFunction(hasTypes, (generator) => {
      generator
        .generateApp(isServer)

        .generateLibsInstances(save.libraries)
        .generateLibsInit(save.libraries)

        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.BEFORE_INIT)
        .generateAppInit()
        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.AFTER_INIT)

        .generateRegistry(save.libraries)

        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.BEFORE_REGISTRY_INIT)
        .generateEntities(save.libraries, save.components, save.entities)
        .generateSystems(save.systems)
        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.AFTER_REGISTRY_INIT)

        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.BEFORE_RUN)
        .generateAppRun(initFunctions)
        .generateInitFunctionIfNeeded(initFunctions, InitFunctionEnum.AFTER_RUN);
    })
    .toString();
};
