const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeUnknown = (
  defaults: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    if (overrideValue === undefined) continue;

    const defaultValue = defaults[key];
    result[key] =
      isPlainObject(defaultValue) && isPlainObject(overrideValue)
        ? mergeUnknown(defaultValue, overrideValue)
        : overrideValue;
  }

  return result;
};

/**
 * Recursively merges `override` onto `defaults`.
 *
 * @remarks
 * Nested plain objects (e.g. `dir`, `out`) are merged key by key. Array
 * values (e.g. `packages`, `libs`) are replaced wholesale by `override`,
 * not concatenated.
 */
export const deepMerge = <T extends Record<string, unknown>>(
  defaults: T,
  override: Partial<T>,
): T => mergeUnknown(defaults, override as Record<string, unknown>) as T;
