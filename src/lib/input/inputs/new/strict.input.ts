import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getStrictInput = (inputs: Input) => {
  return getBooleanInput(inputs, "strict");
};

export const getStrictOrAsk = (inputs: Input) => {
  return getInputOrAsk(getStrictInput(inputs), () =>
    askConfirm(Messages.NEW_STRICT_QUESTION, { default: true }),
  );
};
