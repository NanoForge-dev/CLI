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

export interface EditorConfig {
  editor?: {
    /** Entry point used to build/run this project in editor mode (`--editor`). */
    entryFile?: string;
  };
}

export interface LanguageConfig {
  /** Source language, used to pick `.ts`/`.js` component and system schematic templates. */
  language?: "ts" | "js";
}

export interface TlsConfig {
  tls?:
    | {
        enable?: false;
      }
    | {
        enable: true;
        cert: string;
        key: string;
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
