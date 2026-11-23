import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { treeKill } from "@lib/tree-kill";

import { AbstractAction, type HandleResult } from "./abstract.action";

vi.mock("@lib/tree-kill", () => ({ treeKill: vi.fn().mockResolvedValue(undefined) }));

class ChildrenAction extends AbstractAction {
  protected startMessage = "Start";
  protected successMessage = "Done";
  protected failureMessage = "Children failed!";

  constructor(private readonly tasks: () => Promise<boolean>[]) {
    super();
  }

  public handle(): Promise<HandleResult> {
    return this.waitForChildren(this.tasks());
  }
}

const never = () => new Promise<boolean>(() => undefined);

describe("AbstractAction with child processes", () => {
  let exit: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;
  let signalListeners: Map<string, () => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    signalListeners = new Map();
    vi.spyOn(process, "once").mockImplementation(((event: string, listener: () => void) => {
      signalListeners.set(event, listener);
      return process;
    }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stops the other children and exits 1 with the failure message when one fails", async () => {
    await new ChildrenAction(() => [Promise.resolve(false), never()]).run();

    expect(error).toHaveBeenCalledWith(expect.stringContaining("Children failed!"));
    expect(treeKill).toHaveBeenCalledWith(process.pid, "SIGTERM");
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("prints the error of a child that rejects", async () => {
    await new ChildrenAction(() => [
      Promise.reject(new Error("exited with code 1")),
      never(),
    ]).run();

    expect(error).toHaveBeenCalledWith("exited with code 1");
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("prints the failure before stopping the process tree", async () => {
    const order: string[] = [];
    error.mockImplementation(() => order.push("print"));
    vi.mocked(treeKill).mockImplementation(async () => {
      order.push("kill");
    });

    await new ChildrenAction(() => [Promise.resolve(false)]).run();

    expect(order.indexOf("print")).toBeLessThan(order.indexOf("kill"));
  });

  it("neither fails nor exits when every child ends cleanly", async () => {
    await new ChildrenAction(() => [Promise.resolve(true), Promise.resolve(true)]).run();

    expect(treeKill).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it("leaves Ctrl+C to the signal handler: a child stopped by it is not a failure", async () => {
    let stopChild: (ok: boolean) => void = () => undefined;
    const run = new ChildrenAction(() => [
      new Promise<boolean>((resolve) => (stopChild = resolve)),
    ]).run();

    signalListeners.get("SIGINT")?.();
    stopChild(false);
    await run;

    expect(treeKill).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("Children failed!"));
  });

  it("prints no header when the child's own failure line already says it", async () => {
    const action = new ChildrenAction(() => [Promise.resolve(false)]);
    Object.assign(action, { childFailureMessage: "" });

    await action.run();

    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("Children failed!"));
    expect(exit).toHaveBeenCalledWith(1);
  });
});
