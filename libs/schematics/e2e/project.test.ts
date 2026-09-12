import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

// The factory resolves real registry versions (respecting a 48h trust
// window) for standalone projects, so we can't assert an exact pinned
// number here — only that a registry-resolved value or a workspace-linking
// protocol came back.
// Includes semver-range fallbacks (e.g. "^2") so this still passes when the
// registry is unreachable and the fetcher falls back to its default.
const RESOLVED_VERSION = /^(\d+\.\d+\.\d+|workspace:\*|\*|\^\d+(\.\d+){0,2})$/;

describe("project schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("client project with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "my-workspace",
        directory: "apps/client",
      });
    });

    it("should generate the project structure under apps/client", () => {
      expect(tree.files).toContain("/apps/client/package.json");
      expect(tree.files).toContain("/apps/client/tsconfig.json");
      expect(tree.files).toContain("/apps/client/nanoforge.config.ts");
      expect(tree.files).toContain("/apps/client/src/main.ts");
      expect(tree.files).toContain("/apps/client/src/components/drawable-circle-2d.component.ts");
      expect(tree.files).toContain("/apps/client/src/components/position-2d.component.ts");
      expect(tree.files).toContain("/apps/client/src/systems/draw-2d.system.ts");
      expect(tree.files).toContain("/apps/client/assets/.gitkeep");
    });

    it("should derive the package name from workspaceName and part", () => {
      const packageJson = JSON.parse(tree.readContent("/apps/client/package.json"));
      expect(packageJson.name).toBe("my-workspace-client");
    });

    it("should include client-only dependencies", () => {
      const packageJson = JSON.parse(tree.readContent("/apps/client/package.json"));
      expect(packageJson.devDependencies["@nanoforge-dev/graphics-2d"]).toBeDefined();
      expect(packageJson.devDependencies["@nanoforge-dev/input"]).toBeDefined();
    });

    it("should declare a client-typed nanoforge.config.ts", () => {
      const content = tree.readContent("/apps/client/nanoforge.config.ts");
      expect(content).toContain('type: "client"');
    });

    it("should generate a client entry point", () => {
      const content = tree.readContent("/apps/client/src/main.ts");
      expect(content).toContain("NanoforgeFactory.createClient({ tickRate: 60 })");
      expect(content).toContain('from "@nanoforge-dev/ecs/client"');
      expect(content).toContain("Graphics2DLibrary");
      expect(content).toContain("InputLibrary");
      expect(content).toContain("NetworkClientLibrary");
    });

    it("should access the graphics library directly off ctx, not through ctx.libs", () => {
      const content = tree.readContent("/apps/client/src/systems/draw-2d.system.ts");
      expect(content).toContain("ctx.graphics");
      expect(content).not.toContain("ctx.libs");
    });

    it("should not generate Dockerfile or init functions by default", () => {
      expect(tree.files).not.toContain("/apps/client/Dockerfile");
      expect(tree.files).not.toContain("/apps/client/.dockerignore");
      const initFiles = tree.files.filter((f) => f.includes("/init/"));
      expect(initFiles).toHaveLength(0);
    });
  });

  describe("server project with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "my-workspace",
        directory: "apps/server",
      });
    });

    it("should generate the project structure under apps/server", () => {
      expect(tree.files).toContain("/apps/server/package.json");
      expect(tree.files).toContain("/apps/server/src/main.ts");
    });

    it("should not include client-only dependencies", () => {
      const packageJson = JSON.parse(tree.readContent("/apps/server/package.json"));
      expect(packageJson.devDependencies["@nanoforge-dev/graphics-2d"]).toBeUndefined();
      expect(packageJson.devDependencies["@nanoforge-dev/input"]).toBeUndefined();
    });

    it("should generate a server entry point", () => {
      const content = tree.readContent("/apps/server/src/main.ts");
      expect(content).toContain("NanoforgeFactory.createServer({ tickRate: 60 })");
      expect(content).toContain('from "@nanoforge-dev/ecs/server"');
      expect(content).not.toContain("Graphics2DLibrary");
      expect(content).toContain("NetworkServerLibrary");
      expect(content).toContain("move2D");
      expect(content).toContain("new Position2D(500, 500)");
    });

    it("should generate a server-side position component and movement system", () => {
      expect(tree.files).toContain("/apps/server/src/components/position-2d.component.ts");
      expect(tree.files).toContain("/apps/server/src/systems/move-2d.system.ts");
      expect(tree.files).not.toContain(
        "/apps/server/src/components/drawable-circle-2d.component.ts",
      );
      expect(tree.files).not.toContain("/apps/server/src/systems/draw-2d.system.ts");
    });
  });

  describe("with hasServer", () => {
    it("keeps the client's position local by default (hasServer omitted)", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "no-server-workspace",
        directory: "no-server-apps/client",
      });
      expect(tree.files).not.toContain(
        "/no-server-apps/client/src/systems/position-sync.system.ts",
      );
      const content = tree.readContent("/no-server-apps/client/src/main.ts");
      expect(content).not.toContain("positionSync");
    });

    it("syncs the client's position from the server when hasServer is true", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "has-server-workspace",
        directory: "has-server-apps/client",
        hasServer: true,
      });
      expect(tree.files).toContain("/has-server-apps/client/src/systems/position-sync.system.ts");
      const content = tree.readContent("/has-server-apps/client/src/main.ts");
      expect(content).toContain('import { positionSync } from "./systems/position-sync.system"');
      expect(content).toContain("registry.addSystem(positionSync)");
    });

    it("is ignored for a server project - position handling is always active there", async () => {
      const tree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "server-has-server-workspace",
        directory: "server-has-server-apps/server",
        hasServer: false,
      });
      expect(tree.files).toContain("/server-has-server-apps/server/src/systems/move-2d.system.ts");
    });
  });

  describe("with docker enabled", () => {
    it("should generate Dockerfile and .dockerignore for a standalone project", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "docker-workspace",
        directory: "docker-apps/client",
        docker: true,
        workspace: false,
      });
      expect(tree.files).toContain("/docker-apps/client/Dockerfile");
      expect(tree.files).toContain("/docker-apps/client/.dockerignore");
    });

    it("should not generate a Dockerfile when the project is inside a workspace", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "docker-in-workspace",
        directory: "docker-in-workspace-apps/client",
        docker: true,
        workspace: true,
      });
      expect(tree.files).not.toContain("/docker-in-workspace-apps/client/Dockerfile");
      expect(tree.files).not.toContain("/docker-in-workspace-apps/client/.dockerignore");
    });

    describe.each(["npm", "yarn", "pnpm", "bun"] as const)(
      "with %s package manager",
      (packageManager) => {
        it("should branch Dockerfile content on the package manager", async () => {
          const tree = await runner.runSchematic("project", {
            part: "client",
            workspaceName: `${packageManager}-workspace`,
            directory: `${packageManager}-apps/client`,
            docker: true,
            workspace: false,
            packageManager,
          });
          const content = tree.readContent(`/${packageManager}-apps/client/Dockerfile`);
          const installCommand = packageManager === "npm" ? "npm ci" : `${packageManager} install`;
          expect(content).toContain(`RUN ${installCommand}`);
          expect(content).toContain(`RUN ${packageManager} run build`);
          expect(content).toContain(`CMD ["${packageManager}", "run", "start"]`);
        });
      },
    );
  });

  describe("dependency versioning via the workspace field", () => {
    describe.each(["npm", "yarn", "pnpm", "bun"] as const)(
      "with %s package manager",
      (packageManager) => {
        it("uses the workspace-linking protocol by default", async () => {
          const tree = await runner.runSchematic("project", {
            part: "client",
            workspaceName: `${packageManager}-dep-workspace`,
            directory: `${packageManager}-dep-apps/client`,
            packageManager,
          });
          const packageJson = JSON.parse(
            tree.readContent(`/${packageManager}-dep-apps/client/package.json`),
          );
          const expected = packageManager === "npm" ? "*" : "workspace:*";
          expect(packageJson.devDependencies["@nanoforge-dev/ecs"]).toBe(expected);
          expect(packageJson.devDependencies["nanoforge"]).toBe(expected);
        });

        it("resolves a real registry version when workspace is false", async () => {
          const tree = await runner.runSchematic("project", {
            part: "client",
            workspaceName: `${packageManager}-standalone-workspace`,
            directory: `${packageManager}-standalone-apps/client`,
            packageManager,
            workspace: false,
          });
          const packageJson = JSON.parse(
            tree.readContent(`/${packageManager}-standalone-apps/client/package.json`),
          );
          expect(packageJson.devDependencies["@nanoforge-dev/ecs"]).toMatch(RESOLVED_VERSION);
          expect(packageJson.devDependencies["nanoforge"]).toMatch(RESOLVED_VERSION);
        });
      },
    );

    it("produces valid JSON for a server project", async () => {
      const tree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "valid-json-workspace",
        directory: "valid-json-apps/server",
      });
      expect(() =>
        JSON.parse(tree.readContent("/valid-json-apps/server/package.json")),
      ).not.toThrow();
    });
  });

  describe("with init functions enabled", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "init-workspace",
        directory: "init-apps/client",
        initFunctions: true,
      });
    });

    it("should generate init function files", () => {
      expect(tree.files).toContain("/init-apps/client/src/init/before-init.ts");
      expect(tree.files).toContain("/init-apps/client/src/init/after-init.ts");
      expect(tree.files).toContain("/init-apps/client/src/init/before-registry-init.ts");
      expect(tree.files).toContain("/init-apps/client/src/init/after-registry-init.ts");
      expect(tree.files).toContain("/init-apps/client/src/init/before-run.ts");
      expect(tree.files).toContain("/init-apps/client/src/init/after-run.ts");
    });

    it("should wire the init functions into main.ts", () => {
      const content = tree.readContent("/init-apps/client/src/main.ts");
      expect(content).toContain('import { beforeInit } from "./init/before-init"');
      expect(content).toContain("await beforeInit(app);");
      expect(content).toContain("await afterRun(app);");
    });
  });

  describe("with JavaScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "js-workspace",
        directory: "js-apps/client",
        language: "js",
      });
    });

    it("should generate JS files", () => {
      expect(tree.files).toContain("/js-apps/client/src/main.js");
      expect(tree.files).toContain(
        "/js-apps/client/src/components/drawable-circle-2d.component.js",
      );
      expect(tree.files).toContain("/js-apps/client/jsconfig.json");
      expect(tree.files).not.toContain("/js-apps/client/tsconfig.json");
    });
  });

  describe("with libs", () => {
    it("should list libs in nanoforge.config.ts", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "libs-workspace",
        directory: "libs-apps/client",
        libs: ["../../libs/shared"],
      });
      const content = tree.readContent("/libs-apps/client/nanoforge.config.ts");
      expect(content).toContain('libs: ["../../libs/shared"]');
    });
  });

  describe("@nanoforge-dev/ecs and @nanoforge-dev/network version resolution", () => {
    it("still writes the ecs/network keys even though they're resolved via their real per-part packages", async () => {
      // @nanoforge-dev/ecs and @nanoforge-dev/network aren't published under
      // those names (see ecs-lib/ecs-client/ecs-server and
      // network-client/network-server) — the factory aliases to the real
      // package to resolve a trustworthy version, but keeps writing the
      // existing (unchanged) `ecs`/`network` keys.
      const client = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "ecs-alias-client-workspace",
        directory: "ecs-alias-client-apps/client",
        workspace: false,
      });
      const clientPackageJson = JSON.parse(
        client.readContent("/ecs-alias-client-apps/client/package.json"),
      );
      expect(clientPackageJson.devDependencies["@nanoforge-dev/ecs"]).toMatch(RESOLVED_VERSION);
      expect(clientPackageJson.devDependencies["@nanoforge-dev/network"]).toMatch(RESOLVED_VERSION);

      const server = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "ecs-alias-server-workspace",
        directory: "ecs-alias-server-apps/server",
        workspace: false,
      });
      const serverPackageJson = JSON.parse(
        server.readContent("/ecs-alias-server-apps/server/package.json"),
      );
      expect(serverPackageJson.devDependencies["@nanoforge-dev/ecs"]).toMatch(RESOLVED_VERSION);
      expect(serverPackageJson.devDependencies["@nanoforge-dev/network"]).toMatch(RESOLVED_VERSION);
    });
  });

  describe("packageManager (Corepack) field", () => {
    it("is never set on a generated project's package.json", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "no-corepack-workspace",
        directory: "no-corepack-apps/client",
        workspace: false,
        packageManager: "pnpm",
      });
      const packageJson = JSON.parse(tree.readContent("/no-corepack-apps/client/package.json"));
      expect(packageJson.packageManager).toBeUndefined();
    });
  });

  describe("allowBuilds (standalone projects are their own root)", () => {
    it("is ignored when generated inside a workspace, even if passed", async () => {
      const tree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "in-workspace-allow-builds",
        directory: "in-workspace-allow-builds-apps/server",
        packageManager: "pnpm",
        allowBuilds: ["wrtc"],
      });
      expect(tree.files).not.toContain(
        "/in-workspace-allow-builds-apps/server/pnpm-workspace.yaml",
      );
      const packageJson = JSON.parse(
        tree.readContent("/in-workspace-allow-builds-apps/server/package.json"),
      );
      expect(packageJson).not.toHaveProperty("allowScripts");
      expect(packageJson).not.toHaveProperty("trustedDependencies");
    });

    it("writes a pnpm-workspace.yaml allowBuilds map for a standalone pnpm project", async () => {
      const tree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "standalone-allow-builds",
        directory: "standalone-allow-builds-apps/server",
        workspace: false,
        packageManager: "pnpm",
        allowBuilds: ["wrtc"],
      });
      const pnpmWorkspaceYaml = tree.readContent(
        "/standalone-allow-builds-apps/server/pnpm-workspace.yaml",
      );
      expect(pnpmWorkspaceYaml).toContain("allowBuilds:");
      expect(pnpmWorkspaceYaml).toContain("wrtc: true");
    });

    it("does not generate pnpm-workspace.yaml for a standalone pnpm project with no allowBuilds", async () => {
      const tree = await runner.runSchematic("project", {
        part: "client",
        workspaceName: "standalone-no-allow-builds",
        directory: "standalone-no-allow-builds-apps/client",
        workspace: false,
        packageManager: "pnpm",
      });
      expect(tree.files).not.toContain(
        "/standalone-no-allow-builds-apps/client/pnpm-workspace.yaml",
      );
    });

    it("writes allowScripts/trustedDependencies for a standalone npm/bun project", async () => {
      const npmTree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "standalone-npm-allow-builds",
        directory: "standalone-npm-allow-builds-apps/server",
        workspace: false,
        packageManager: "npm",
        allowBuilds: ["wrtc"],
      });
      const npmPackageJson = JSON.parse(
        npmTree.readContent("/standalone-npm-allow-builds-apps/server/package.json"),
      );
      expect(npmPackageJson.allowScripts).toEqual({ wrtc: true });

      const bunTree = await runner.runSchematic("project", {
        part: "server",
        workspaceName: "standalone-bun-allow-builds",
        directory: "standalone-bun-allow-builds-apps/server",
        workspace: false,
        packageManager: "bun",
        allowBuilds: ["wrtc"],
      });
      const bunPackageJson = JSON.parse(
        bunTree.readContent("/standalone-bun-allow-builds-apps/server/package.json"),
      );
      expect(bunPackageJson.trustedDependencies).toEqual(["wrtc"]);
    });
  });
});
