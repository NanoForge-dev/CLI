import type { BaseConfig } from "./base-config.type";

export interface WorkspaceConfig extends BaseConfig<"workspace"> {
  packages?: string[];
  /** `p2p` runs the server app in the host player's browser instead of a server process. */
  network?: "dedicated" | "p2p";
}
