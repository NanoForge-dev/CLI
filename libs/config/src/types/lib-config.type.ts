import type { BaseConfig } from "./base-config.type";

export interface LibConfig extends BaseConfig<"lib"> {
  dir?: {
    assets?: string;
    shared?: string;

    /** Used by the editor only. Should be inside `shared`. */
    components?: string;
    /** Used by the editor only. Should be inside `shared`. */
    systems?: string;
    /** Used by the editor only. Should be inside `shared`. */
    scenes?: string;
  };
}
