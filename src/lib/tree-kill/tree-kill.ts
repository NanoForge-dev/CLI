import { type ChildProcessWithoutNullStreams, execSync, spawn } from "node:child_process";

type ProcessTree = { [key: number]: number[] };

const killPid = (pid: number, signal: NodeJS.Signals): void => {
  try {
    process.kill(pid, signal);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ESRCH") throw err;
  }
};

/**
 * The tree's pids in kill order: a post-order walk from the root, so children are
 * always killed before their parents (descending pid order only does that when
 * pids never wrapped around).
 */
const killOrder = (tree: ProcessTree, root: number): number[] => {
  const order: number[] = [];
  const seen = new Set<number>();
  const visit = (current: number): void => {
    if (seen.has(current)) return;
    seen.add(current);
    for (const child of tree[current] ?? []) visit(child);
    order.push(current);
  };
  visit(root);
  for (const key of Object.keys(tree)) {
    const pid = Number(key);
    if (!seen.has(pid)) {
      seen.add(pid);
      order.push(pid);
    }
  }
  return order;
};

const killAll = (tree: ProcessTree, root: number, signal: NodeJS.Signals): void => {
  for (const pid of killOrder(tree, root)) killPid(pid, signal);
};

const buildProcessTree = (
  parentPid: number,
  tree: ProcessTree,
  pidsToProcess: { [key: number]: number },
  helpers: Set<number>,
  spawnChildProcessesList: (parentPid: string) => ChildProcessWithoutNullStreams,
  cb: () => void,
): void => {
  const ps = spawnChildProcessesList(parentPid.toString());
  // The listing helpers are children of this process: when the root is this process
  // (the signal handler kills its own tree) a helper would list itself as a child.
  if (ps.pid !== undefined) helpers.add(ps.pid);
  let allData = "";
  ps.stdout.on("data", (data: Buffer) => {
    allData += data.toString("ascii");
  });

  ps.on("close", (code: number | null) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pidsToProcess[parentPid];

    if (code !== 0) {
      if (Object.keys(pidsToProcess).length === 0) cb();
      return;
    }

    if (allData)
      allData.match(/\d+/g)?.forEach((childPid: string) => {
        const intPid = Number(childPid);
        if (helpers.has(intPid)) return;
        if (tree[parentPid] === undefined) tree[parentPid] = [];
        tree[parentPid].push(intPid);
        tree[intPid] = [];
        pidsToProcess[intPid] = 1;
        buildProcessTree(intPid, tree, pidsToProcess, helpers, spawnChildProcessesList, cb);
      });
    if (Object.keys(pidsToProcess).length === 0) cb();
  });
};

export const treeKill = (pid: number, signal: NodeJS.Signals): Promise<void> =>
  new Promise((resolve) => {
    if (process.platform === "win32") {
      // taskkill throws when the process is already gone; treeKill runs from a
      // signal handler, where a throw would surface as an unhandled rejection.
      try {
        execSync(`taskkill /pid ${pid} /T /F`);
      } catch {
        // The process tree is already dead: nothing left to kill.
      }
      resolve();
      return;
    }

    const tree: ProcessTree = { [pid]: [] };
    const listChildren =
      process.platform === "darwin"
        ? (parentPid: string) => spawn("pgrep", ["-P", parentPid])
        : (parentPid: string) => spawn("ps", ["-o", "pid", "--no-headers", "--ppid", parentPid]);
    buildProcessTree(pid, tree, { [pid]: 1 }, new Set(), listChildren, () => {
      killAll(tree, pid, signal);
      resolve();
    });
  });
