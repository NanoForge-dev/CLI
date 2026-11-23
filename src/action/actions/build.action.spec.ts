import { defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";
import { watch } from "chokidar";
import { join, relative, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type WorkspaceConfig } from "@lib/config";
import { type Input } from "@lib/input";

import { CLIError } from "@utils/errors";

import { BuildAction, createRebuildQueue } from "./build.action";

vi.mock("chokidar", () => ({ watch: vi.fn() }));

interface BuildTargetShape {
  name: string;
  directory: string;
  entry: string;
  static?: string;
  sources?: string[];
  output: string;
  platform: "browser" | "node";
  sourcemap: boolean;
  keep?: string[];
}

type ResolveTargets = (
  workspace: WorkspaceConfig,
  baseDirectory: string,
  options: Input,
  isEditor: boolean,
) => BuildTargetShape[];

const resolveTargets = (
  workspace: WorkspaceConfig,
  baseDirectory: string,
  options: Input = new Map(),
  isEditor = false,
): BuildTargetShape[] => {
  const action = new BuildAction();
  const fn = (action as unknown as { resolveTargets: ResolveTargets }).resolveTargets;
  return fn.call(action, workspace, baseDirectory, options, isEditor);
};

const clientProject = { type: "project", config: { type: "client" } } as const;
const serverProject = { type: "project", config: { type: "server" } } as const;

const p2pWorkspace = (): WorkspaceConfig =>
  ({
    type: "workspace",
    config: { network: "p2p" },
    projects: { client: clientProject, server: serverProject },
  }) as unknown as WorkspaceConfig;

describe("BuildAction.resolveTargets", () => {
  it("should add a browser copy of the server target for each node target in p2p mode", () => {
    const targets = resolveTargets(p2pWorkspace(), "/ws");

    expect(targets).toHaveLength(3);

    const client = targets.find((target) => target.name.startsWith("Client"));
    const server = targets.find((target) => target.name === "Server (server)");
    const browserServer = targets.find((target) => target.name === "Server (server) (browser)");

    expect(client?.platform).toBe("browser");
    expect(server?.platform).toBe("node");
    expect(browserServer).toBeDefined();
    expect(browserServer?.platform).toBe("browser");
    // The browser copy of the server is emitted inside the client's output.
    expect(browserServer?.output).toBe(
      relative(
        join("/ws", "server"),
        join(join("/ws", "client"), defaultClientConfig.out.dir, "server"),
      ),
    );
    expect(browserServer?.directory).toBe(server?.directory);
    expect(browserServer?.entry).toBe(server?.entry);
  });

  it("should keep the browser server build when the client output is reset in p2p mode", () => {
    const targets = resolveTargets(p2pWorkspace(), "/ws");
    const client = targets.find((target) => target.platform === "browser");
    const browserServer = targets.find((target) => target.name === "Server (server) (browser)");

    expect(client?.keep).toEqual(["server"]);
    expect(browserServer?.keep).toBeUndefined();
  });

  it("should not add browser copies outside p2p mode", () => {
    const workspace = {
      type: "workspace",
      config: { network: "lan" },
      projects: { client: clientProject, server: serverProject },
    } as unknown as WorkspaceConfig;

    const targets = resolveTargets(workspace, "/ws");

    expect(targets).toHaveLength(2);
    expect(targets.map((target) => target.platform)).toEqual(["browser", "node"]);
  });

  it("should not add browser copies in p2p mode when there is no client target", () => {
    const workspace = {
      type: "workspace",
      config: { network: "p2p" },
      projects: { server: serverProject },
    } as unknown as WorkspaceConfig;

    const targets = resolveTargets(workspace, "/ws");

    expect(targets).toHaveLength(1);
    expect(targets[0]?.platform).toBe("node");
  });

  it("should point the browser server output at the overridden client output folder", () => {
    const options: Input = new Map([["clientOutDir", { value: "public" }]]);

    const targets = resolveTargets(p2pWorkspace(), "/ws", options);
    const browserServer = targets.find((target) => target.name === "Server (server) (browser)");

    expect(browserServer?.output).toBe(
      relative(join("/ws", "server"), join(join("/ws", "client"), "public", "server")),
    );
  });

  it("should use the config defaults for a single project and skip name disambiguation", () => {
    const workspace = {
      type: "project",
      config: { type: "client" },
    } as unknown as WorkspaceConfig;

    const targets = resolveTargets(workspace, "/ws");

    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      name: "Client",
      directory: "/ws",
      entry: defaultClientConfig.entryFile,
      static: defaultClientConfig.dir.assets,
      output: defaultClientConfig.out.dir,
      platform: "browser",
      sourcemap: false,
    });
  });

  it("should use the editor entry point and enable sourcemaps in editor mode", () => {
    const workspace = {
      type: "project",
      config: { type: "server" },
    } as unknown as WorkspaceConfig;

    const targets = resolveTargets(workspace, "/ws", new Map(), true);

    expect(targets[0]).toMatchObject({
      name: "Server",
      entry: defaultServerConfig.editor.entryFile,
      sourcemap: true,
    });
  });
});

describe("BuildAction.resolveTargets output guard", () => {
  const project = { type: "project", config: { type: "client" } } as unknown as WorkspaceConfig;
  const withOutDir = (outDir: string): Input => new Map([["clientOutDir", { value: outDir }]]);

  it.each([".", "", "..", "../other", "/tmp/out", "src", "assets", "assets/out"])(
    "should refuse the output folder %j before anything is deleted",
    (outDir) => {
      expect(() => resolveTargets(project, "/ws", withOutDir(outDir))).toThrow(CLIError);
    },
  );

  it.each(["dist", "build/client", "src/dist", "./out"])(
    "should accept the output folder %j",
    (outDir) => {
      expect(() => resolveTargets(project, "/ws", withOutDir(outDir))).not.toThrow();
    },
  );

  it("should refuse a config out.dir that holds the entry file", () => {
    const workspace = {
      type: "project",
      config: { type: "server", entryFile: "main.ts", out: { dir: "." } },
    } as unknown as WorkspaceConfig;

    expect(() => resolveTargets(workspace, "/ws")).toThrow(/refusing to build Server/);
  });

  it.each(["src/components", "src/systems", "src/scenes", "nf_modules"])(
    "should refuse the source folder %j",
    (outDir) => {
      expect(() => resolveTargets(project, "/ws", withOutDir(outDir))).toThrow(CLIError);
    },
  );

  it("should refuse the configured dir.components folder", () => {
    const workspace = {
      type: "project",
      config: { type: "client", dir: { components: "game/components" }, out: { dir: "game" } },
    } as unknown as WorkspaceConfig;

    expect(() => resolveTargets(workspace, "/ws")).toThrow(/overlaps the sources/);
  });

  it("should accept the p2p browser server output inside the client output", () => {
    expect(() => resolveTargets(p2pWorkspace(), "/ws")).not.toThrow();
  });
});

describe("createRebuildQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const deferredBuild = () => {
    const finish: (() => void)[] = [];
    const build = vi.fn(() => new Promise<void>((resolve) => finish.push(resolve)));
    return { build, finish: () => finish.shift()?.() };
  };

  it("should debounce a burst of events into one build", async () => {
    const build = vi.fn(async () => undefined);
    const trigger = createRebuildQueue(build, 100);

    trigger();
    trigger();
    await vi.advanceTimersByTimeAsync(50);
    trigger();
    await vi.advanceTimersByTimeAsync(100);

    expect(build).toHaveBeenCalledTimes(1);
  });

  it("should never run two builds at once and queue at most one more", async () => {
    const { build, finish } = deferredBuild();
    const trigger = createRebuildQueue(build, 100);

    trigger();
    await vi.advanceTimersByTimeAsync(100);
    expect(build).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 3; i++) {
      trigger();
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(build).toHaveBeenCalledTimes(1);

    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(build).toHaveBeenCalledTimes(2);

    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(build).toHaveBeenCalledTimes(2);
  });
});

describe("BuildAction.watchTarget", () => {
  it("should watch the entry and assets folders for added, changed and deleted files", () => {
    const on = vi.fn();
    vi.mocked(watch).mockReturnValue({ on } as unknown as ReturnType<typeof watch>);
    const onChange = vi.fn();
    const target: BuildTargetShape = {
      name: "Client",
      directory: "/ws",
      entry: "src/main.ts",
      static: "assets",
      output: "dist",
      platform: "browser",
      sourcemap: false,
    };

    const action = new BuildAction() as unknown as {
      watchTarget: (target: BuildTargetShape, onChange: () => void) => void;
    };
    action.watchTarget(target, onChange);

    const [paths, options] = vi.mocked(watch).mock.calls[0] ?? [];
    expect(paths).toEqual([resolve("/ws", "src"), resolve("/ws", "assets")]);
    expect(options).toMatchObject({ ignoreInitial: true });
    const ignored = (options as { ignored: (path: string) => boolean }).ignored;
    expect(ignored(resolve("/ws", "dist", "main.js"))).toBe(true);
    expect(ignored(resolve("/ws", "src", "main.ts"))).toBe(false);

    expect(on).toHaveBeenCalledWith("all", expect.any(Function));
    const handler = on.mock.calls[0]?.[1] as (event: string) => void;
    handler("add");
    handler("unlink");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
