export const getInputOrAsk = async <T>(
  baseInput: T | undefined,
  askCb: () => Promise<T>,
  defaultValue?: T,
): Promise<T> => {
  if (baseInput !== undefined) return baseInput;
  const res = await askCb();
  if (res !== undefined) return res;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error("No input provided");
};
