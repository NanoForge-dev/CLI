import { input } from "@inquirer/prompts";

import { promptError } from "@utils/errors";

interface InputOptions {
  default?: string;
  required: boolean;
}

interface InputArrayOptions {
  default?: string;
  required: boolean;
  split: string;
  filter: boolean;
}

export const askInput = async (
  question: string,
  baseOptions?: Partial<InputOptions>,
): Promise<string | never> => {
  const options: InputOptions = {
    required: false,
    ...(baseOptions ?? {}),
  };
  return await input({
    message: question,
    required: options.required,
    default: options.default,
  }).catch(promptError);
};

export const askInputArray = async (
  question: string,
  baseOptions?: Partial<InputArrayOptions>,
): Promise<string[] | never> => {
  const options: InputArrayOptions = {
    required: false,
    split: " ",
    filter: true,
    ...(baseOptions ?? {}),
  };
  const res = (
    await input({
      message: question,
      required: options.required,
      default: options.default,
    }).catch(promptError)
  ).split(options.split);
  return options.filter ? res.filter((r) => r.length) : res;
};
