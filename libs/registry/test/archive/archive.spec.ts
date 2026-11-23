import { strToU8, zipSync } from "fflate";
import { mkdirSync, mkdtempSync, rmSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { packFolder, readArchive, zipFolder } from "../../src/archive/archive";

const CENTRAL_ENTRY = 0x02014b50;

/** A one-file stored zip whose directory claims other packed and unpacked sizes. */
const lyingZip = (packed: number, unpacked: number): Uint8Array => {
  const zip = zipSync({ "a.txt": [strToU8("hello"), { level: 0 }] });
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  for (let offset = 0; offset < zip.length - 4; offset++) {
    if (view.getUint32(offset, true) !== CENTRAL_ENTRY) continue;
    view.setUint32(offset + 20, packed, true);
    view.setUint32(offset + 24, unpacked, true);
  }
  return zip;
};

describe("readArchive", () => {
  it("reads the files of an archive", () => {
    const files = readArchive(zipSync({ "a.txt": strToU8("hello") }));
    expect([...files.keys()]).toEqual(["a.txt"]);
  });

  it("counts what a stored entry allocates, whatever size it claims unpacked", () => {
    expect(() => readArchive(lyingZip(300 * 1024 * 1024, 0))).toThrow(/too large/);
  });
});

describe("zipFolder", () => {
  it("leaves out what `ignore` names, folders with all they hold", async () => {
    const folder = mkdtempSync(join(tmpdir(), "nf-zip-"));
    try {
      mkdirSync(join(folder, "src/node_modules/x"), { recursive: true });
      writeFileSync(join(folder, "a.txt"), "a");
      writeFileSync(join(folder, "src/b.ts"), "b");
      writeFileSync(join(folder, "src/.env"), "SECRET=1");
      writeFileSync(join(folder, "src/node_modules/x/index.js"), "x");

      const all = readArchive(await zipFolder(folder));
      expect([...all.keys()].sort()).toEqual([
        "a.txt",
        "src/.env",
        "src/b.ts",
        "src/node_modules/x/index.js",
      ]);

      const seen: [string, boolean][] = [];
      const some = readArchive(
        await zipFolder(folder, {
          ignore: (path, isDirectory) => {
            seen.push([path, isDirectory]);
            return path.endsWith(".env") || path.endsWith("node_modules");
          },
        }),
      );
      expect([...some.keys()].sort()).toEqual(["a.txt", "src/b.ts"]);
      expect(seen).toContainEqual(["src/node_modules", true]);
      expect(seen).not.toContainEqual(["src/node_modules/x", true]);
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});

describe("packFolder", () => {
  it("lists the files it packed, with their sizes", async () => {
    const folder = mkdtempSync(join(tmpdir(), "nf-zip-"));
    try {
      mkdirSync(join(folder, "src"));
      writeFileSync(join(folder, "a.txt"), "hello");
      writeFileSync(join(folder, "src/b.ts"), "b");

      const { archive, files } = await packFolder(folder);
      expect(files).toEqual([
        { path: "a.txt", size: 5 },
        { path: "src/b.ts", size: 1 },
      ]);
      expect([...readArchive(archive).keys()]).toEqual(["a.txt", "src/b.ts"]);
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  it("stops before reading a folder past 256 MiB, naming the limit", async () => {
    const folder = mkdtempSync(join(tmpdir(), "nf-zip-"));
    try {
      // A sparse file: 257 MiB on paper, nothing on disk.
      writeFileSync(join(folder, "big.bin"), "");
      truncateSync(join(folder, "big.bin"), 257 * 1024 * 1024);

      await expect(zipFolder(folder)).rejects.toThrow(/too large \(256 MiB/);
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});
