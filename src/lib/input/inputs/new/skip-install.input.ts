import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNewSkipInstallInput = (inputs: Input) => {
  return getBooleanInput(inputs, "skipInstall");
};

export const getNewSkipInstallOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewSkipInstallInput(inputs), () =>
    askConfirm(Messages.NEW_SKIP_INSTALL_QUESTION, { default: false }),
  );
};
