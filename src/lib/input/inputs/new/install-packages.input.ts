import { askConfirm } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getBooleanInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getNewInstallPackagesInput = (inputs: Input) => {
  return getBooleanInput(inputs, "installPackages");
};

export const getNewInstallPackagesOrAsk = (inputs: Input) => {
  return getInputOrAsk(getNewInstallPackagesInput(inputs), () =>
    askConfirm(Messages.NEW_SERVER_QUESTION, { default: false }),
  );
};
