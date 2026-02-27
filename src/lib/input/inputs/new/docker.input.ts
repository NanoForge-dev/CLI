import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { type Input } from "../../input.type";

const getDockerInput = (inputs: Input) => {
  return getBooleanInput(inputs, "docker");
};

export const getDockerOrAsk = (inputs: Input) => {
  return getInputOrAsk(getDockerInput(inputs), () =>
    askConfirm(Messages.NEW_DOCKER_QUESTION, { default: true }),
  );
};
