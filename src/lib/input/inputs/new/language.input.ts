import { askSelect } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getStringInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getLanguageInput = (inputs: Input) => {
  return getStringInput(inputs, "language");
};

export const getNewLanguageInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getLanguageInput(inputs), () =>
    askSelect<"ts" | "js">(Messages.NEW_LANGUAGE_QUESTION, [{ value: "ts" }, { value: "js" }], {
      default: "ts",
    }),
  );
};
