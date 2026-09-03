export interface BuildConfig {
  entry: string;
}

export interface EditorConfig {
  entry: string;
  save: string;
}

export interface ClientConfig {
  enable: boolean;
  port: string;
  outDir: string;
  build: BuildConfig;
  editor: EditorConfig;
}

export interface ServerConfig {
  enable: boolean;
  outDir: string;
  build: BuildConfig;
  editor: EditorConfig;
}

export interface Config {
  name: string;
  language: "ts" | "js";
  initFunctions: boolean;
  client: ClientConfig;
  server: ServerConfig;
}
