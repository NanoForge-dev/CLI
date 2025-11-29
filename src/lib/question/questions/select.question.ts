import { checkbox, select } from "@inquirer/prompts";

import { promptError } from "@utils/errors";

interface SelectChoice<T> {
  value: T;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  type?: never;
}

type SelectChoices<T> = string[] | SelectChoice<T>[];

interface MultiSelectChoice<T> {
  value: T;
  name?: string;
  checkedName?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
  checked?: boolean;
  type?: never;
}

type MultiSelectChoices<T> = string[] | MultiSelectChoice<T>[];

interface SelectOptions<T> {
  default?: T;
  loop: boolean;
}

interface MultiSelectOptions {
  loop: boolean;
  required: boolean;
}
export const askSelect = async <T = string>(
  question: string,
  choices: SelectChoices<T>,
  baseOptions?: Partial<SelectOptions<T>>,
): Promise<T | never> => {
  const options: SelectOptions<T> = {
    loop: true,
    ...(baseOptions ?? {}),
  };
  return await select({
    message: question,
    choices,
    loop: options.loop,
    default: options.default,
  }).catch(promptError);
};

export const askMultiSelect = async <T = string>(
  question: string,
  choices: MultiSelectChoices<T>,
  baseOptions?: Partial<MultiSelectOptions>,
): Promise<T[] | never> => {
  const options: MultiSelectOptions = {
    loop: true,
    required: false,
    ...(baseOptions ?? {}),
  };
  return await checkbox({
    message: question,
    choices,
    loop: options.loop,
    required: options.required,
  }).catch(promptError);
};
