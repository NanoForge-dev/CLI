import { defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { type WorkspaceConfig } from "@lib/config";
import { type Input } from "@lib/input";

import { BuildAction } from "./build.action";

interface BuildTargetShape {
  name: string;
  directory: string;
  entry: string;
  static?: string;
  output: string;
  platform: "browser" | "node";
  sourcemap: boolean;
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
