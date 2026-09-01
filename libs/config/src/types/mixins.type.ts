export interface ContainLibConfig {
  libs?: string[];
}

export interface BuildableConfig {
  entryFile?: string;
  out?: {
    dir?: string;
    mainFile?: string;
  };
}

export interface SourceableConfig {
  dir?: {
    assets?: string;
    packages?: string;

    /** Used by the editor only. */
    components?: string;
    /** Used by the editor only. */
    systems?: string;
    /** Used by the editor only. */
    scenes?: string;
  };
}
