export interface PluginSchema {
  /**
   * Plugin name in the registry, as @scope/name
   */
  name: string;

  /**
   * Plugin destination directory. Defaults to the plugin's short name.
   */
  directory?: string | null;

  /**
   * What to start from: a panel (default) or a color theme with no code
   */
  template?: "panel" | "theme";
}
