import type { NanoforgeConfig } from "./types";

/**
 * Identity function used to get type-checking and editor autocompletion on
 * a `nanoforge.config.ts` file's default export.
 */
export const defineConfig = <T extends NanoforgeConfig>(config: T): T => config;
