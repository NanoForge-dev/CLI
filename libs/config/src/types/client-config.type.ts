import type { BaseConfig } from "./base-config.type";
import type {
  BuildableConfig,
  ContainLibConfig,
  EditorConfig,
  LanguageConfig,
  SourceableConfig,
  SslConfig,
} from "./mixins.type";

export interface ClientConfig
  extends
    BaseConfig<"client">,
    SourceableConfig,
    BuildableConfig,
    ContainLibConfig,
    EditorConfig,
    LanguageConfig,
    SslConfig {
  /** Port the client dev-server loader listens on. */
  port?: string;
}
