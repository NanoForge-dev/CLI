/**
 * Common shape every `nanoforge.config.ts` file's default export satisfies.
 */
export interface BaseConfig<T extends string> {
  type: T;
}
