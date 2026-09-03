import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("docker schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("with npm package manager", () => {
    let tree: UnitTestTree;

    describe.each(["npm", "yarn", "pnpm", "bun"] as const)(
      "with ${packageManager} package manager",
      (packageManager) => {
        beforeAll(async () => {
          tree = await runner.runSchematic("docker", {
            directory: `${packageManager}-test-app`,
            packageManager,
          });
        });

        it("should create Dockerfile", () => {
          expect(tree.files).toContain(`/${packageManager}-test-app/Dockerfile`);
          expect(tree.files).toContain(`/${packageManager}-test-app/.dockerignore`);
        });

        it("should create docker file with install command", () => {
          const content = tree.readContent(`/${packageManager}-test-app/Dockerfile`);
          expect(content).toContain(`RUN ${packageManager} install`);
        });

        it("should create docker file with build command", () => {
          const content = tree.readContent(`/${packageManager}-test-app/Dockerfile`);
          expect(content).toContain(`RUN ${packageManager} run build`);
        });

        it("should create docker file with start command", () => {
          const content = tree.readContent(`/${packageManager}-test-app/Dockerfile`);
          expect(content).toContain(`CMD ["${packageManager}", "run", "start"]`);
        });
      },
    );
  });
});
