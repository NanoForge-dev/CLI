import { type AddressInfo, createServer } from "node:net";
import open from "open";
import { resolve } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";

import { EditorAction } from "./editor.action";

vi.mock("open", () => ({ default: vi.fn() }));

vi.mock("@lib/package-manager", () => ({
  PackageManagerFactory: { create: vi.fn() },
  PackageManagerName: { LOCAL_BUN: "local_bun" },
}));

vi.mock("@utils/path", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getModulePath: vi.fn(() => resolve("editor")),
}));

/** What the editor's /healthz answers. */
const healthz = () => ({ ok: true, json: () => Promise.resolve({ ok: true, version: "1.1.0" }) });

const options = (entries: [string, unknown][]): Input =>
  new Map(entries.map(([key, value]) => [key, { value }]));

describe("EditorAction.handle", () => {
  const run = vi.fn();
  const fetch = vi.fn();
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PackageManagerFactory.create).mockReturnValue({ run } as any);
    vi.stubGlobal("fetch", fetch);
    log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(process, "once").mockImplementation((() => process) as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const editorRunning = () =>
    log.mock.calls.some(([line]: unknown[]) => String(line).includes("Editor running!"));

  it("fails, without saying the editor runs, when the editor exits before it answers", async () => {
    run.mockResolvedValue(false);
    fetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await new EditorAction().handle(new Map(), options([["port", "5199"]]));

    expect(result).toMatchObject({ keepAlive: true, success: false });
    expect(editorRunning()).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  it("prints the URL and opens the browser only once /healthz answers", async () => {
    let stop: (ok: boolean) => void = () => undefined;
    run.mockReturnValue(new Promise<boolean>((resolve) => (stop = resolve)));
    fetch.mockRejectedValueOnce(new Error("ECONNREFUSED")).mockImplementation(() => {
      expect(editorRunning()).toBe(false);
      return Promise.resolve(healthz());
    });

    const handled = new EditorAction().handle(
      new Map([["path", { value: "game" }]]),
      options([["port", "5199"]]),
    );
    await vi.waitFor(() => expect(editorRunning()).toBe(true), { timeout: 2000 });
    expect(open).toHaveBeenCalledWith("http://localhost:5199/load?path=game");

    stop(true);
    await expect(handled).resolves.toEqual({ keepAlive: true });
  });

  it("refuses to start when an editor already answers on the port", async () => {
    fetch.mockResolvedValue(healthz());

    await expect(new EditorAction().handle(new Map(), options([["port", "5199"]]))).rejects.toThrow(
      "Port 5199 is already used by a NanoForge editor.",
    );
    expect(run).not.toHaveBeenCalled();
    expect(editorRunning()).toBe(false);
  });

  it("starts when the port answers 200 but is not an editor (a dev server's page)", async () => {
    run.mockResolvedValue(true);
    fetch.mockResolvedValue({ ok: true, json: () => Promise.reject(new SyntaxError("<html>")) });

    await new EditorAction().handle(new Map(), options([["port", "5199"]]));

    expect(run).toHaveBeenCalled();
  });

  it("warns with the URL, instead of hanging, when the port never replies", async () => {
    vi.unstubAllGlobals(); // a real fetch against a server that accepts and never answers
    const silent = createServer(() => undefined);
    await new Promise<void>((resolve) => silent.listen(0, "127.0.0.1", resolve));
    const { port } = silent.address() as AddressInfo;
    let stop: (ok: boolean) => void = () => undefined;
    run.mockReturnValue(new Promise<boolean>((resolve) => (stop = resolve)));

    const action = new EditorAction();
    Object.assign(action, { readyTimeoutMs: 1500 });
    const handled = action.handle(new Map(), options([["port", String(port)]]));

    try {
      await vi.waitFor(
        () =>
          expect(log).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`Warning.*http://localhost:${port}`)),
          ),
        { timeout: 8000 },
      );
      expect(editorRunning()).toBe(false);
      expect(open).not.toHaveBeenCalled();
      stop(true);
      await handled;
    } finally {
      silent.close();
    }
  }, 15_000);
});
