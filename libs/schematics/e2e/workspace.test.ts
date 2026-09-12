import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

// The factory resolves real registry versions (respecting a 48h trust
// window), so we can't assert exact pinned numbers here — only that a
// registry-resolved value or a workspace-linking protocol came back.
// Includes semver-range fallbacks (e.g. "latest") so this still passes when
// the registry is unreachable and the fetcher falls back to its default.
const RESOLVED_VERSION = /^(\d+\.\d+\.\d+|workspace:\*|\*|latest|\^\d+(\.\d+){0,2})$/;

describe("workspace schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("with TypeScript (default)", () => {
    let tree: UnitTestTree;
    let packageJson: any;

    beforeAll(async () => {
      tree = await runner.runSchematic("workspace", { name: "my-workspace" });
      packageJson = JSON.parse(tree.readContent("/my-workspace/package.json"));
    });

    it("should generate workspace files", () => {
      expect(tree.files).toContain("/my-workspace/package.json");
      expect(tree.files).toContain("/my-workspace/tsconfig.json");
      expect(tree.files).toContain("/my-workspace/tsconfig.spec.json");
      expect(tree.files).toContain("/my-workspace/.gitignore");
      expect(tree.files).toContain("/my-workspace/nanoforge.config.ts");
      expect(tree.files).toContain("/my-workspace/README.md");
      expect(tree.files).not.toContain("/my-workspace/pnpm-workspace.yaml");
    });

    it("does not generate any lint tooling files or the prettier/eslint dependencies", () => {
      expect(tree.files).not.toContain("/my-workspace/eslint.config.js");
      expect(tree.files).not.toContain("/my-workspace/prettier.config.js");
      expect(tree.files).not.toContain("/my-workspace/.prettierignore");
      expect(packageJson.devDependencies["prettier"]).toBeUndefined();
      expect(packageJson.devDependencies["eslint"]).toBeUndefined();
      expect(packageJson.scripts.lint).toBeUndefined();
      expect(packageJson.scripts.format).toBeUndefined();
    });

    it("should set the workspace name in package.json", () => {
      expect(packageJson.name).toBe("my-workspace");
    });

    it("should declare npm workspaces in package.json (apps only, no libs)", () => {
      expect(packageJson.workspaces).toEqual(["apps/*"]);
    });

    it("does not include @nanoforge-dev/core", () => {
      expect(packageJson.devDependencies["@nanoforge-dev/core"]).toBeUndefined();
    });

    it("should not include pnpm config by default", () => {
      expect(packageJson).not.toHaveProperty("pnpm");
    });

    it("should resolve real versions for cli/nanoforge/typescript", () => {
      expect(packageJson.devDependencies["@nanoforge-dev/cli"]).toMatch(RESOLVED_VERSION);
      expect(packageJson.devDependencies["nanoforge"]).toMatch(RESOLVED_VERSION);
      expect(packageJson.devDependencies["typescript"]).toMatch(RESOLVED_VERSION);
    });

    it("pins typescript to a specific version, not a range", () => {
      expect(packageJson.devDependencies["typescript"]).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("does not jump typescript to its major-7 native rewrite", () => {
      const version = packageJson.devDependencies["typescript"] as string;
      expect(version.split(".")[0]).toBe("6");
    });

    it("should declare a workspace-typed nanoforge.config.ts with apps only (no libs)", () => {
      const content = tree.readContent("/my-workspace/nanoforge.config.ts");
      expect(content).toContain('type: "workspace"');
      expect(content).toContain('packages: ["apps/*"]');
    });

    it("does not set a packageManager (Corepack) field", () => {
      expect(packageJson.packageManager).toBeUndefined();
    });
  });

  describe("with JavaScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("workspace", {
        name: "js-workspace",
        language: "js",
      });
    });

    it("should generate JS workspace files", () => {
      expect(tree.files).toContain("/js-workspace/package.json");
      expect(tree.files).toContain("/js-workspace/jsconfig.json");
      expect(tree.files).toContain("/js-workspace/nanoforge.config.js");
      expect(tree.files).not.toContain("/js-workspace/tsconfig.json");
      expect(tree.files).not.toContain("/js-workspace/nanoforge.config.ts");
    });

    it("has the same package.json shape as the TypeScript workspace, minus typescript itself", () => {
      const packageJson = JSON.parse(tree.readContent("/js-workspace/package.json"));
      expect(packageJson.devDependencies["typescript"]).toBeUndefined();
      expect(packageJson.devDependencies["@nanoforge-dev/cli"]).toMatch(RESOLVED_VERSION);
      expect(packageJson.devDependencies["@nanoforge-dev/core"]).toBeUndefined();
      expect(packageJson.devDependencies["prettier"]).toBeUndefined();
      expect(packageJson.version).toBeUndefined();
      expect(packageJson.author).toBeUndefined();
      expect(packageJson.description).toBeUndefined();
      expect(packageJson).not.toHaveProperty("lint-staged");
      expect(packageJson.workspaces).toEqual(["apps/*"]);
    });

    it("does not generate any lint tooling files (same as TypeScript)", () => {
      expect(tree.files).not.toContain("/js-workspace/eslint.config.js");
      expect(tree.files).not.toContain("/js-workspace/prettier.config.js");
      expect(tree.files).not.toContain("/js-workspace/.prettierignore");
    });
  });

  describe("with custom directory", () => {
    it("should generate files in the specified directory", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "my-workspace",
        directory: "custom-dir",
      });
      expect(tree.files).toContain("/custom-dir/package.json");
    });
  });

  describe("with pnpm", () => {
    it("should generate pnpm-specific files and no npm workspaces field", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "pnpm-workspace",
        packageManager: "pnpm",
      });
      expect(tree.files).toContain("/pnpm-workspace/pnpm-workspace.yaml");
      const packageJson = JSON.parse(tree.readContent("/pnpm-workspace/package.json"));
      // pnpm 10+ no longer reads the "pnpm" field from package.json (it warns and
      // ignores it); build-script approval now lives in pnpm-workspace.yaml's
      // `allowBuilds` map instead. See https://pnpm.io/settings.
      expect(packageJson).not.toHaveProperty("pnpm");
      expect(packageJson.workspaces).toBeUndefined();
      expect(packageJson.devDependencies["@nanoforge-dev/cli"]).toBe("workspace:*");
    });

    it("should generate a pnpm-workspace.yaml with apps only (no libs)", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "pnpm-packages-workspace",
        packageManager: "pnpm",
      });
      const pnpmWorkspaceYaml = tree.readContent("/pnpm-packages-workspace/pnpm-workspace.yaml");
      expect(pnpmWorkspaceYaml).toContain('- "apps/*"');
      expect(pnpmWorkspaceYaml).not.toContain("libs/*");
    });

    it("always allows bun's build script in pnpm-workspace.yaml's allowBuilds map", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "pnpm-default-allow-builds-workspace",
        packageManager: "pnpm",
      });
      const pnpmWorkspaceYaml = tree.readContent(
        "/pnpm-default-allow-builds-workspace/pnpm-workspace.yaml",
      );
      expect(pnpmWorkspaceYaml).toContain("allowBuilds:");
      expect(pnpmWorkspaceYaml).toContain("bun: true");
    });

    it("adds user-requested packages to pnpm-workspace.yaml's allowBuilds map alongside bun", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "pnpm-allow-builds-workspace",
        packageManager: "pnpm",
        allowBuilds: ["esbuild"],
      });
      const pnpmWorkspaceYaml = tree.readContent(
        "/pnpm-allow-builds-workspace/pnpm-workspace.yaml",
      );
      expect(pnpmWorkspaceYaml).toContain("bun: true");
      expect(pnpmWorkspaceYaml).toContain("esbuild: true");
    });
  });

  describe("with npm", () => {
    it("always allows bun's build script via package.json's allowScripts", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "npm-allow-scripts-workspace",
        packageManager: "npm",
        allowBuilds: ["esbuild"],
      });
      expect(tree.files).not.toContain("/npm-allow-scripts-workspace/pnpm-workspace.yaml");
      const packageJson = JSON.parse(tree.readContent("/npm-allow-scripts-workspace/package.json"));
      expect(packageJson.allowScripts).toEqual({ bun: true, esbuild: true });
    });
  });

  describe("with bun", () => {
    it("always allows bun's build script via package.json's trustedDependencies", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "bun-trusted-deps-workspace",
        packageManager: "bun",
        allowBuilds: ["esbuild"],
      });
      expect(tree.files).not.toContain("/bun-trusted-deps-workspace/pnpm-workspace.yaml");
      const packageJson = JSON.parse(tree.readContent("/bun-trusted-deps-workspace/package.json"));
      expect(packageJson.trustedDependencies).toEqual(["bun", "esbuild"]);
    });
  });

  describe("with yarn", () => {
    it("should not generate pnpm-workspace.yaml, no script-allow field, and pinned versions", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "yarn-workspace",
        packageManager: "yarn",
      });
      expect(tree.files).not.toContain("/yarn-workspace/pnpm-workspace.yaml");
      const packageJson = JSON.parse(tree.readContent("/yarn-workspace/package.json"));
      expect(packageJson).not.toHaveProperty("allowScripts");
      expect(packageJson).not.toHaveProperty("trustedDependencies");
      expect(packageJson.workspaces).toEqual(["apps/*"]);
      expect(packageJson.devDependencies["@nanoforge-dev/cli"]).toMatch(RESOLVED_VERSION);
    });
  });

  describe("with docker disabled (default)", () => {
    it("should not generate a Dockerfile or .dockerignore", async () => {
      const tree = await runner.runSchematic("workspace", { name: "no-docker-workspace" });
      expect(tree.files).not.toContain("/no-docker-workspace/Dockerfile");
      expect(tree.files).not.toContain("/no-docker-workspace/.dockerignore");
    });
  });

  describe("with docker enabled", () => {
    it("should generate Dockerfile and .dockerignore", async () => {
      const tree = await runner.runSchematic("workspace", {
        name: "docker-workspace",
        docker: true,
      });
      expect(tree.files).toContain("/docker-workspace/Dockerfile");
      expect(tree.files).toContain("/docker-workspace/.dockerignore");
    });

    describe.each(["npm", "yarn", "pnpm", "bun"] as const)(
      "with %s package manager",
      (packageManager) => {
        it("should branch Dockerfile content on the package manager", async () => {
          const tree = await runner.runSchematic("workspace", {
            name: `${packageManager}-docker-workspace`,
            docker: true,
            packageManager,
          });
          const content = tree.readContent(`/${packageManager}-docker-workspace/Dockerfile`);
          const installCommand = packageManager === "npm" ? "npm ci" : `${packageManager} install`;
          expect(content).toContain(`RUN ${installCommand}`);
          expect(content).toContain(`RUN ${packageManager} run build`);
          expect(content).toContain(`CMD ["${packageManager}", "run", "start"]`);
        });
      },
    );
  });
});
