export interface PluginSchema {
  /**
   * Plugin name in the registry, as @scope/name
   */
  name: string;

  /**
   * Plugin destination directory. Defaults to the plugin's short name.
   */
  directory?: string | null;
}
