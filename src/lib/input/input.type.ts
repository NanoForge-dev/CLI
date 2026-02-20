export interface InputValue {
  value?: boolean | string | string[] | undefined;
  options?: Record<string, unknown>;
}

export type Input = Map<string, InputValue>;
