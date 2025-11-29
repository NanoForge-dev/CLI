import { confirm } from "@inquirer/prompts";

import { promptError } from "@utils/errors";

interface ConfirmOptions {
  default: boolean;
}

export const askConfirm = async (
  question: string,
  baseOptions?: Partial<ConfirmOptions>,
): Promise<boolean | never> => {
  const options: ConfirmOptions = {
    default: false,
    ...(baseOptions ?? {}),
  };
  return await confirm({
    message: question,
    default: options.default,
  }).catch(promptError);
};
