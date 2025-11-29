import { number } from "@inquirer/prompts";

import { promptError } from "@utils/errors";

interface NumberOptions {
  default?: number;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | "any" | undefined;
  required: boolean;
}

export const askNumber = async (
  question: string,
  baseOptions?: Partial<NumberOptions>,
): Promise<number | never> => {
  const options: NumberOptions = {
    required: false,
    ...(baseOptions ?? {}),
  };
  const res = await number({
    message: question,
    default: options.default,
    min: options.min,
    max: options.max,
    step: options.step,
    required: options.required,
  }).catch(promptError);

  if (res === undefined || isNaN(res) || !isFinite(res)) throw new Error("Invalid number");
  return res;
};
