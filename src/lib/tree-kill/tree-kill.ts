import { type ChildProcessWithoutNullStreams, execSync, spawn } from "node:child_process";

export const treeKill = (pid: number, signal: NodeJS.Signals): Promise<void> => {
  function extracted(resolve: any) {
    const tree: { [key: number]: number[] } = {};
    const pidsToProcess: { [key: number]: number } = {};
    tree[pid] = [];
    pidsToProcess[pid] = 1;

    switch (process.platform) {
      case "win32":
        execSync("taskkill /pid " + pid + " /T /F");
        resolve();
        break;
      case "darwin":
        buildProcessTree(
          pid,
          tree,
          pidsToProcess,
          function (parentPid: string) {
            return spawn("pgrep", ["-P", parentPid]);
          },
          function () {
            killAll(tree, signal);
            resolve();
          },
        );
        break;
      default: // Linux
        buildProcessTree(
          pid,
          tree,
          pidsToProcess,
          function (parentPid: string) {
            return spawn("ps", ["-o", "pid", "--no-headers", "--ppid", parentPid]);
          },
          function () {
            killAll(tree, signal);
            resolve();
          },
        );
        break;
    }
  }
  return new Promise((resolve) => {
    extracted(resolve);
  });
};

function killAll(tree: { [key: number]: number[] }, signal: NodeJS.Signals) {
  const killed: { [key: number]: boolean } = {};
  Object.keys(tree)
    .reverse()
    .forEach(function (pidStr) {
      const pid = Number(pidStr);
      tree[pid]?.forEach(function (pidpid: number) {
        if (!killed[pidpid]) {
          killPid(pidpid, signal);
          killed[pidpid] = true;
        }
      });
      if (!killed[pid]) {
        killPid(pid, signal);
        killed[pid] = true;
      }
    });
}

function killPid(pid: number, signal: NodeJS.Signals) {
  try {
    process.kill(pid, signal);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== "ESRCH") throw err;
  }
}

function buildProcessTree(
  parentPid: number,
  tree: { [key: number]: number[] },
  pidsToProcess: { [key: number]: number },
  spawnChildProcessesList: (parentPid: string) => ChildProcessWithoutNullStreams,
  cb: () => void,
) {
  const ps = spawnChildProcessesList(parentPid.toString());
  let allData = "";
  ps.stdout.on("data", function (data) {
    allData += data.toString("ascii");
  });

  const onClose = function (code: number | null) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pidsToProcess[parentPid];

    if (code != 0) {
      if (Object.keys(pidsToProcess).length == 0) {
        cb();
      }
      return;
    }

    if (allData)
      allData.match(/\d+/g)?.forEach(function (pid: string) {
        const intPid = Number(pid);
        if (tree[parentPid] === undefined) {
          tree[parentPid] = [];
        }
        tree[parentPid].push(intPid);
        tree[intPid] = [];
        pidsToProcess[intPid] = 1;
        buildProcessTree(intPid, tree, pidsToProcess, spawnChildProcessesList, cb);
      });
  };

  ps.on("close", onClose);
}
