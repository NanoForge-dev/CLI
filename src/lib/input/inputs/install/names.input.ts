import { askInputArray } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getArrayInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNamesInput = (inputs: Input) => {
  return getArrayInput(inputs, "names");
};

export const getInstallNamesInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNamesInput(inputs), () =>
    askInputArray(Messages.INSTALL_NAMES_QUESTION, { required: true }),
  );
};
