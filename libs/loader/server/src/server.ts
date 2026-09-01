import { program } from "commander";
import { type ChildProcess, fork } from "node:child_process";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getFiles } from "./files";
import { startWatch } from "./watch";

const bootstrap = async () => {
  program
    .name("server loader")
    .description("run server loader")
    .option("-d, --dir <dir>", "dir of the game", ".nanoforge/server")
    .option("--watch", "watch the game dir", false)
    .parse();

  const { dir, watch } = program.opts<{
    dir: string;
    watch: boolean;
  }>();

  const paths = getFiles(dir);
  let mainPath: string | undefined = undefined;

  paths.filter(([path, fullPath]) => {
    if (path !== "/main.js") return true;
    mainPath = fullPath;
    return false;
  });

  if (!mainPath) throw new Error("No main.js found");

  let child: ChildProcess | undefined;

  const runWorker = async () => {
    if (child) {
      child.kill();
      child = undefined;
    }

    const __filename = fileURLToPath(import.meta.url);
    child = fork(
      join(dirname(__filename), "worker.js"),
      [mainPath as string, JSON.stringify(paths)],
      { env: process.env },
    );
  };

  if (watch) startWatch(dir, runWorker);

  await runWorker();
};

bootstrap().then();
