import { describe, expect, it } from "vitest";

import { SchematicOption } from "./schematic.option";

describe("SchematicOption", () => {
  describe("normalizedName", () => {
    it("should convert camelCase to kebab-case", () => {
      const option = new SchematicOption("packageManager", "npm");
      expect(option.normalizedName).toBe("package-manager");
    });

    it("should keep already kebab-case name", () => {
      const option = new SchematicOption("skip-install", true);
      expect(option.normalizedName).toBe("skip-install");
    });
  });

  describe("toCommandString", () => {
    it("should format name field with kebab-case formatting", () => {
      const option = new SchematicOption("name", "MyApp");
      expect(option.toCommandString()).toEqual(["--name=-my-app"]);
    });

    it("should format version field without extra quoting", () => {
      const option = new SchematicOption("version", "1.0.0");
      expect(option.toCommandString()).toEqual(["--version=1.0.0"]);
    });

    it("should format path field without extra quoting", () => {
      const option = new SchematicOption("path", "/some/path");
      expect(option.toCommandString()).toEqual(["--path=/some/path"]);
    });

    it("should wrap other string values in quotes", () => {
      const option = new SchematicOption("description", "My project");
      expect(option.toCommandString()).toEqual(['--description="My project"']);
    });

    it("should format boolean true", () => {
      const option = new SchematicOption("strict", true);
      expect(option.toCommandString()).toEqual(["--strict=true"]);
    });

    it("should format boolean false", () => {
      const option = new SchematicOption("strict", false);
      expect(option.toCommandString()).toEqual(["--strict=false"]);
    });

    it("should handle nested options array", () => {
      const nested = [new SchematicOption("enable", true)];
      const option = new SchematicOption("server", nested);
      expect(option.toCommandString()).toEqual(["--server.enable=true"]);
    });

    it("should handle prefix parameter", () => {
      const option = new SchematicOption("enable", true);
      expect(option.toCommandString("server")).toEqual(["--server.enable=true"]);
    });

    it("should escape parentheses in name formatting", () => {
      const option = new SchematicOption("name", "my(app)");
      expect(option.toCommandString()).toEqual(["--name=my\\(app\\)"]);
    });

    it("should escape brackets in name formatting", () => {
      const option = new SchematicOption("name", "my[app]");
      expect(option.toCommandString()).toEqual(["--name=my\\[app\\]"]);
    });
  });
});
