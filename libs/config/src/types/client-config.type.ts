import type { BaseConfig } from "./base-config.type";
import type { BuildableConfig, ContainLibConfig, SourceableConfig } from "./mixins.type";

export interface ClientConfig
  extends BaseConfig<"client">, SourceableConfig, BuildableConfig, ContainLibConfig {}
