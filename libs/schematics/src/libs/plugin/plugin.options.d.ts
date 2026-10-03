export interface PluginOptions {
  /**
   * `@scope/name`, the name in the registry
   */
  name: string;

  /**
   * `name`: the folder, and the prefix of the css file and the panel class
   */
  short: string;

  /**
   * `Name`, shown in the editor
   */
  title: string;

  /**
   * `name` in camelCase: the prefix of the widget and command ids
   */
  id: string;

  /** Resolved version of @nanoforge-dev/editor-sdk */
  editorSdkVersion: string;

  /** Resolved version of @nanoforge-dev/editor-vite-plugin */
  editorVitePluginVersion: string;
}
