import { type PackageManagerCommands } from "./package-manager-commands";
import { PackageManagerName } from "./package-manager-name";

export const PM_CONFIGS: Record<
  PackageManagerName,
  { binary: string; commands: PackageManagerCommands }
> = {
  [PackageManagerName.BUN]: {
    binary: "bun",
    commands: {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      exec: "exec",
      run: "run",
      saveFlag: "--save",
      saveDevFlag: "--dev",
      silentFlag: "--silent",
    },
  },
  [PackageManagerName.LOCAL_BUN]: {
    binary: "bun",
    commands: {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      exec: "exec",
      run: "run",
      build: "build",
      runFile: "run",
      saveFlag: "--save",
      saveDevFlag: "--dev",
      silentFlag: "--silent",
    },
  },
  [PackageManagerName.NPM]: {
    binary: "npm",
    commands: {
      install: "install",
      add: "install",
      update: "update",
      remove: "uninstall",
      exec: "exec",
      run: "run",
      runArgsFlag: "--",
      saveFlag: "--save",
      saveDevFlag: "--save-dev",
      silentFlag: "--silent",
    },
  },
  [PackageManagerName.PNPM]: {
    binary: "pnpm",
    commands: {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      exec: "exec",
      run: "run",
      saveFlag: "-P",
      saveDevFlag: "-D",
      silentFlag: "--silent",
    },
  },
  [PackageManagerName.YARN]: {
    binary: "yarn",
    commands: {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      exec: "exec",
      run: "run",
      saveFlag: "",
      saveDevFlag: "-D",
      silentFlag: "--silent",
    },
  },
};
