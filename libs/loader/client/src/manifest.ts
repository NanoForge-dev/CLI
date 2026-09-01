import { updateFiles } from "./files";
import { MANIFEST } from "./server";

export const updateManifest = async (dir: string) => {
  MANIFEST.files = [];
  await updateFiles(dir);
  MANIFEST.version = await getVersion(dir);
};

const getVersion = async (dir: string) => {
  try {
    return await Bun.file("public/version").text();
  } catch {
    return await fingerprintFiles(dir);
  }
};

const fingerprintFiles = async (dir: string): Promise<string> => {
  const stamps = await Promise.all(
    MANIFEST.files.map(async ({ path }) => {
      try {
        const stat = await Bun.file(`${dir}${path}`).stat();
        return `${path}:${stat.size}:${stat.mtimeMs}`;
      } catch {
        return `${path}:missing`;
      }
    }),
  );
  stamps.sort();
  return Bun.hash(stamps.join("|")).toString(16);
};
