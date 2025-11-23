export interface InputValue {
  value?: boolean | string | string[] | undefined;
  options?: any;
}

export type Input = Map<string, InputValue>;
