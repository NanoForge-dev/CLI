import { askInput } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getStringInput } from "../../base-inputs";
import { type Input } from "../../input.type";

const getApiKeyInput = (inputs: Input) => {
  return getStringInput(inputs, "apiKey");
};

export const getLoginApiKeyInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getApiKeyInput(inputs), () =>
    askInput(Messages.LOGIN_API_KEY_QUESTION, {
      required: true,
    }),
  );
};
