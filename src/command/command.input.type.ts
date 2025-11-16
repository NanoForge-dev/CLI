export interface InputValue {
  value?: boolean | string | string[];
  options?: any;
}

export type Input = Map<string, InputValue>;
