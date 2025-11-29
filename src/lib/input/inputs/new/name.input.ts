import { askInput } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getStringInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNameInput = (inputs: Input) => {
  return getStringInput(inputs, "name");
};

export const getNewNameInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNameInput(inputs), () =>
    askInput(Messages.NEW_NAME_QUESTION, {
      required: true,
      default: "nanoforge-app",
    }),
  );
};
