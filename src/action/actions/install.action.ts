import { input } from "@inquirer/prompts";
import * as ansis from "ansis";
import { Answers } from "inquirer";

import { Input } from "../../command";
import {
  PackageManager,
  PackageManagerFactory,
} from "../../lib/package-manager";
import { generateInput } from "../../lib/questions/questions";
import { Messages } from "../../lib/ui";
import { promptError } from "../../lib/utils/errors";
import { AbstractAction } from "../abstract.action";
import { getDirectoryInput } from "../common/inputs";

export class InstallAction extends AbstractAction {
  public async handle(args: Input, options: Input) {
    console.info(Messages.INSTALL_START);
    console.info();

    await askForMissingInformation(args);

    const names = (getLibrariesNamesInput(args)?.value ?? []) as string[];
    const directory = getDirectoryInput(options);

    await installPackages(names, directory);

    process.exit(0);
  }
}

const getLibrariesNamesInput = (inputs: Input) => inputs.get("names");

const askForMissingInformation = async (args: Input) => {
  const namesInput = getLibrariesNamesInput(args);
  if (!namesInput?.value) {
    const question = generateInput("names", Messages.INSTALL_NAMES_QUESTION)();
    const answer = await input(question).catch(promptError);
    const names = answer.split(" ").filter((name) => name.length);

    replaceInputMissingInformation(args, "names", {
      value: names.length ? names : undefined,
    });
  }
};

const replaceInputMissingInformation = (
  inputs: Input,
  field: string,
  answer: Answers,
): void => {
  const input = inputs.get(field);

  if (input) {
    input.value = input.value !== undefined ? input.value : answer.value;
    inputs.set(field, input);
  } else {
    inputs.set(field, { value: answer.value });
  }
};

const installPackages = async (names: string[], directory: string) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    await packageManager.addProduction(directory, names);
  } catch (error) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
