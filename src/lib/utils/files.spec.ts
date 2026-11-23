import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileSystemError } from "@utils/errors";

import { copyFiles, getUnsafeOutDirReason, resetFolder } from "./files";

describe("files", () => {
  let root: string;
  let from: string;
  let to: string;

  beforeEach(() => {
    root = fs.mkdtempSync(join(tmpdir(), "nf-files-"));
    from = join(root, "assets");
    to = join(root, "dist");
    fs.mkdirSync(from);
    fs.mkdirSync(to);
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  describe("copyFiles", () => {
    it("should copy flat files into the destination folder", () => {
      fs.writeFileSync(join(from, "a.txt"), "alpha");
      fs.writeFileSync(join(from, "b.txt"), "beta");

      copyFiles(from, to);

      expect(fs.readFileSync(join(to, "a.txt"), "utf8")).toBe("alpha");
      expect(fs.readFileSync(join(to, "b.txt"), "utf8")).toBe("beta");
    });

    it("should copy nested assets into nested destination folders", () => {
      fs.mkdirSync(join(from, "img", "icons"), { recursive: true });
      fs.writeFileSync(join(from, "img", "logo.png"), "logo");
      fs.writeFileSync(join(from, "img", "icons", "check.svg"), "check");

      copyFiles(from, to);

      expect(fs.readFileSync(join(to, "img", "logo.png"), "utf8")).toBe("logo");
      expect(fs.readFileSync(join(to, "img", "icons", "check.svg"), "utf8")).toBe("check");
    });

    it("should silently return when the source folder is missing", () => {
      expect(() => copyFiles(join(root, "does-not-exist"), to)).not.toThrow();
      expect(fs.readdirSync(to)).toEqual([]);
    });

    it("should throw a FileSystemError when the destination folder is missing", () => {
      fs.writeFileSync(join(from, "a.txt"), "alpha");

      expect(() => copyFiles(from, join(root, "no-such-dir"))).toThrow(FileSystemError);
    });
  });

  describe("resetFolder", () => {
    it("should create the folder when it does not exist yet", () => {
      const folder = join(root, "fresh");

      resetFolder(folder);

      expect(fs.existsSync(folder)).toBe(true);
      expect(fs.readdirSync(folder)).toEqual([]);
    });

    it("should empty an existing folder, including nested files", () => {
      const folder = join(root, "out");
      fs.mkdirSync(join(folder, "sub"), { recursive: true });
      fs.writeFileSync(join(folder, "sub", "old.js"), "old");

      resetFolder(folder);

      expect(fs.existsSync(folder)).toBe(true);
      expect(fs.readdirSync(folder)).toEqual([]);
    });
  });

  describe("getUnsafeOutDirReason", () => {
    const project = join(tmpdir(), "project");
    const reason = (outDir: string, sources = ["src/main.ts", "assets"]) =>
      getUnsafeOutDirReason(project, project, outDir, sources);

    it("should refuse the project folder, a parent, an absolute path or a folder outside", () => {
      expect(reason(".")).toMatch(/project folder or one of its parents/);
      expect(reason("..")).toMatch(/project folder or one of its parents/);
      expect(reason("../sibling")).toMatch(/outside the project folder/);
      expect(reason(join(project, "dist"))).toMatch(/relative/);
    });

    it("should refuse a folder that holds the sources or sits in the assets", () => {
      expect(reason("src")).toMatch(/overlaps the sources/);
      expect(reason("assets")).toMatch(/overlaps the sources/);
      expect(reason("assets/out")).toMatch(/overlaps the sources/);
    });

    it("should accept a folder inside the project apart from the sources", () => {
      expect(reason("dist")).toBeUndefined();
      expect(reason("src/dist")).toBeUndefined();
      expect(reason("..dist")).toBeUndefined();
    });

    it("should check a nested target against the root it is given", () => {
      const server = join(project, "server");
      expect(
        getUnsafeOutDirReason(project, server, "../client/dist/server", ["src/main.ts"]),
      ).toBeUndefined();
    });
  });
});
