import type { BaseConfig } from "./base-config.type";

export interface WorkspaceConfig extends BaseConfig<"workspace"> {
  packages?: string[];
}
