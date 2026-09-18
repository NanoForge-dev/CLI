import type { BaseConfig } from "./base-config.type";
import type {
  BuildableConfig,
  ContainLibConfig,
  EditorConfig,
  SourceableConfig,
  TlsConfig,
} from "./mixins.type";

export interface ClientConfig
  extends
    BaseConfig<"client">,
    SourceableConfig,
    BuildableConfig,
    ContainLibConfig,
    EditorConfig,
    TlsConfig {
  /** Port the client dev-server loader listens on. */
  port?: string;
}
