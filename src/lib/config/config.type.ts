export interface BuildPartConfig {
  entryFile: string;
  outDir: string;
}

interface BuildClientConfig extends BuildPartConfig {}

interface BuildServerConfig extends BuildPartConfig {}

interface BuildConfig {
  client: BuildClientConfig;
  server: BuildServerConfig;
}

export interface Config {
  build: BuildConfig;
}
