import { askInput } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

const getGitRemoteInput = (inputs: Input) => {
  return getStringInput(inputs, "gitRemote");
};

export const getNewGitRemoteInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getGitRemoteInput(inputs), () =>
    askInput(Messages.NEW_GIT_REMOTE_QUESTION, {
      required: false,
      default: "",
    }),
  );
};
