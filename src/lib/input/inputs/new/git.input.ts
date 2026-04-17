import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { type Input } from "../../input.type";

const getNewGitInput = (inputs: Input) => {
  return getBooleanInput(inputs, "git");
};

export const getNewGitOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewGitInput(inputs), () =>
    askConfirm(Messages.NEW_GIT_QUESTION, { default: true }),
  );
};
