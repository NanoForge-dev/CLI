import { askInput } from "@lib/question";
import { Messages } from "@lib/ui";

import { InvalidCommandArgumentError } from "@utils/errors";

import { getInputOrAsk } from "../ask-inputs";
import { getStringInput } from "../base-inputs";
import { type Input } from "../input.type";

const getNameInput = (inputs: Input) => {
  return getStringInput(inputs, "name");
};

export const getNewNameInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(
    getNameInput(inputs),
    () =>
      askInput(Messages.NEW_NAME_QUESTION, {
        required: true,
        default: "nanoforge-app",
      }),
    "--name",
  );
};

export const getPluginNameInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(
    getNameInput(inputs),
    () =>
      askInput(Messages.CREATE_PLUGIN_NAME_QUESTION, {
        required: true,
        default: "@nanoforge/ecs",
      }),
    "--name",
  );
};

/** Turns into a class or function name, so it must give a valid identifier. */
const ELEMENT_NAME = /^[A-Za-z][A-Za-z0-9_-]*$/;

export const getCreateNameInputOrAsk = async (inputs: Input) => {
  const name = await getInputOrAsk(
    getNameInput(inputs),
    () =>
      askInput(Messages.CREATE_NAME_QUESTION, {
        required: true,
        default: "example",
      }),
    "--name",
  );
  if (!ELEMENT_NAME.test(name)) {
    throw new InvalidCommandArgumentError(
      "name",
      `letters, digits, '-' and '_', starting with a letter, got '${name}'`,
    );
  }
  return name;
};
