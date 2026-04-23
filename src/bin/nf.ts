#!/usr/bin/env node
import { program } from "commander";
import "reflect-metadata";

import { treeKill } from "@lib/tree-kill";

import { loadLocalBinCommandLoader, localBinExists } from "@utils/local-binaries";

import { CommandLoader } from "~/command";

import * as pkg from "../../package.json";

const bootstrap = async () => {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT", "SIGBREAK"];

  signals.forEach((signal) => {
    const listener = async () => {
      process.off(signal, listener);
      await treeKill(process.pid, signal);
    };

    process.on(signal, listener);
  });

  program
    .version(pkg.version ?? "unknown", "-v, --version", "output the current version")
    .usage("<command> [options]")
    .helpOption("-h, --help", "output usage information");

  if (localBinExists()) {
    const localCommandLoader = await loadLocalBinCommandLoader();
    await localCommandLoader.load(program);
  } else {
    await CommandLoader.load(program);
  }
  await program.parseAsync(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

void bootstrap();
