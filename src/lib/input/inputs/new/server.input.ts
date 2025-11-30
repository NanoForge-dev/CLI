import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNewServerInput = (inputs: Input) => {
  return getBooleanInput(inputs, "server");
};

export const getNewServerOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewServerInput(inputs), () =>
    askConfirm(Messages.NEW_SERVER_QUESTION, { default: false }),
  );
};
