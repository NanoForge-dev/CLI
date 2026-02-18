export interface PackageManagerCommands {
  install: string;
  add: string;
  update: string;
  remove: string;
  exec: string;
  run: string;
  build?: string;
  runFile?: string;
  saveFlag: string;
  saveDevFlag: string;
  silentFlag: string;
}
