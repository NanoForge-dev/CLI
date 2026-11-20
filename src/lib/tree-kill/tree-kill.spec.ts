import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { treeKill } from "./tree-kill";

const isAlive = (pid: number): boolean => {
  // A zombie is dead for our purposes: it cannot run anymore, it is only waiting
  // for its (possibly also killed) parent to reap it.
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    return stat.slice(stat.lastIndexOf(")") + 2).split(" ")[0] !== "Z";
  } catch {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }
};

const childPids = (pid: number): number[] => {
  try {
    const out =
      process.platform === "darwin"
        ? execFileSync("pgrep", ["-P", String(pid)], { encoding: "utf8" })
        : execFileSync("ps", ["-o", "pid", "--no-headers", "--ppid", String(pid)], {
            encoding: "utf8",
          });
    return out.split(/\s+/).filter(Boolean).map(Number);
  } catch {
    return [];
  }
};

const waitFor = async (condition: () => boolean, timeoutMs = 15_000): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error("Timed out waiting for the process tree.");
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

describe.skipIf(process.platform === "win32")("treeKill", () => {
  it("kills a two-level process tree", { timeout: 30_000 }, async () => {
    // A root shell running a child shell that runs `sleep`: two levels to kill.
    const root = spawn("sh", ["-c", "sh -c 'sleep 300 & wait' & wait"], { stdio: "ignore" });
    const rootPid = root.pid as number;

    let descendants: number[] = [];
    await waitFor(() => {
      descendants = childPids(rootPid).flatMap((child) => [child, ...childPids(child)]);
      return descendants.length >= 2;
    });
    expect(isAlive(rootPid)).toBe(true);
    for (const pid of descendants) expect(isAlive(pid)).toBe(true);

    await treeKill(rootPid, "SIGKILL");

    await waitFor(() => !isAlive(rootPid) && descendants.every((pid) => !isAlive(pid)));
  });

  it("resolves when the process is already dead", { timeout: 30_000 }, async () => {
    const dead = spawn("sh", ["-c", "exit 0"], { stdio: "ignore" });
    await new Promise((resolve) => dead.on("exit", resolve));
    await expect(treeKill(dead.pid as number, "SIGTERM")).resolves.toBeUndefined();
  });
});
