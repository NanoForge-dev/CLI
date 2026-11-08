export const CONFIG_FILE_NAME = "nanoforge.config.json";
export const GLOBAL_CONFIG_FILE_NAME = ".nanoforgerc";
export const DEFAULT_DIRECTORY = ".";
export const NANOFORGE_DIR = ".nanoforge";
/** The API holding `/registry/…`: set at build time (`.env.build`), the editor's default too. */
export const REGISTRY_URL = process.env.REGISTRY_URL || "https://api.nanoforge.eu";
