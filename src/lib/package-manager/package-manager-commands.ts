export interface PackageManagerCommands {
  install: string;
  add: string;
  update: string;
  remove: string;
  build?: string;
  run?: string;
  saveFlag: string;
  saveDevFlag: string;
  silentFlag: string;
}
