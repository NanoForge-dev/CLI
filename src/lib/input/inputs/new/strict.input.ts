import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNewStrictInput = (inputs: Input) => {
  return getBooleanInput(inputs, "strict");
};

export const getNewStrictOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewStrictInput(inputs), () =>
    askConfirm(Messages.NEW_STRICT_QUESTION, { default: true }),
  );
};
