import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { type Input } from "../../input.type";

const getNewDockerInput = (inputs: Input) => {
  return getBooleanInput(inputs, "docker");
};

export const getNewDockerOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewDockerInput(inputs), () =>
    askConfirm(Messages.NEW_DOCKER_QUESTION, { default: true }),
  );
};
