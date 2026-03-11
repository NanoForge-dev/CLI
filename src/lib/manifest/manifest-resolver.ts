import { GlobalConfigHandler } from "@lib/global-config";
import { type Repository, withAuth } from "@lib/http";
import { type FullManifest, type Manifest } from "@lib/manifest/manifest.type";

interface ManifestDeps {
  nf: Record<string, FullManifest>;
  npm: [string, string][];
}

export const resolveManifestDependencies = async (
  names: string[],
  dir?: string,
): Promise<ManifestDeps> => {
  const client = withAuth(GlobalConfigHandler.read(dir).apiKey, false);
  return concatDeps(await Promise.all(names.map(async (d) => resolveDeps(d, client))));
};

const resolveManifest = async (name: string, client: Repository): Promise<FullManifest | never> => {
  return await client.get(`/registry/${name}`);
};

const resolveDeps = async (name: string, client: Repository): Promise<ManifestDeps> => {
  const manifest = await resolveManifest(name, client);
  const baseDeps = manifest.dependencies ?? [];
  const deps = await Promise.all(baseDeps.map(async (d) => resolveDeps(d, client)));
  return concatDeps(
    [{ nf: { [manifest.name]: manifest }, npm: getNpmDeps(manifest) }].concat(deps),
  );
};

const getNpmDeps = (manifest: Manifest): [string, string][] => {
  return Object.entries(manifest.npmDependencies ?? {});
};

const concatDeps = (deps: ManifestDeps[]): ManifestDeps => {
  return {
    npm: deps.map(({ npm }) => npm).flat(),
    nf: Object.fromEntries(deps.map(({ nf }) => Object.entries(nf)).flat()),
  };
};
