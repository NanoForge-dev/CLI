#!/usr/bin/env node
import { program } from "commander";
import "reflect-metadata";

import { CommandLoader } from "../command";
import {
  loadLocalBinCommandLoader,
  localBinExists,
} from "../lib/utils/local-binaries";

const bootstrap = async () => {
  program
    .version(
      (await import("../../package.json")).version ?? "unknown",
      "-v, --version",
      "output the current version",
    )
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

bootstrap().then();
