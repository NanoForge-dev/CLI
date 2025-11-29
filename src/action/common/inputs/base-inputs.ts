import { Input } from "../../../command";

export const getStringInput = (
  input: Input,
  field: string,
): string | undefined => {
  const value = input.get(field)?.value;
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new Error(`Invalid type for ${field}`);
};

export const getStringInputWithDefault = (
  input: Input,
  field: string,
  defaultValue: string,
): string => {
  return getStringInput(input, field) ?? defaultValue;
};

export const getBooleanInput = (
  input: Input,
  field: string,
): boolean | undefined => {
  const value = input.get(field)?.value;
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  throw new Error(`Invalid type for ${field}`);
};

export const getBooleanInputWithDefault = (
  input: Input,
  field: string,
  defaultValue: boolean,
): boolean => {
  return getBooleanInput(input, field) ?? defaultValue;
};

export const getArrayInput = (
  input: Input,
  field: string,
): string[] | undefined => {
  const value = input.get(field)?.value;
  if (value === undefined) return undefined;
  if (typeof value === "object" && Array.isArray(value)) return value;
  throw new Error(`Invalid type for ${field}`);
};

export const getArrayInputWithDefault = (
  input: Input,
  field: string,
  defaultValue: string[],
): string[] => {
  return getArrayInput(input, field) ?? defaultValue;
};
