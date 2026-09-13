import type { BaseConfig } from "./base-config.type";
import type {
  BuildableConfig,
  ContainLibConfig,
  EditorConfig,
  LanguageConfig,
  SourceableConfig,
} from "./mixins.type";

export interface ServerConfig
  extends
    BaseConfig<"server">,
    SourceableConfig,
    BuildableConfig,
    ContainLibConfig,
    EditorConfig,
    LanguageConfig {}
