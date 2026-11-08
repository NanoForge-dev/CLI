/**
 * Mocks globalThis.fetch for the CLI subprocess: no request reaches a real registry.
 * Loaded via NODE_OPTIONS="--import /path/to/fetch-mock.mjs".
 *
 * Env vars:
 *   MOCK_REGISTRY_STATUS  HTTP status of every answer (default: 200)
 *   MOCK_REGISTRY_DIR     a folder registry (`<dir>/@scope/name/<version>/`) served on the
 *                         registry's read routes, through the registry lib's own stand-in
 *   MOCK_REGISTRY_LOG     a file each request is appended to, as a JSON line
 *                         (`{ method, url, authorization, files }`, files of a published archive)
 */
import { appendFileSync } from "node:fs";

const mockStatus = parseInt(process.env.MOCK_REGISTRY_STATUS ?? "200", 10);
const { MOCK_REGISTRY_DIR: dir, MOCK_REGISTRY_LOG: log } = process.env;

const registry = dir
  ? await import("@nanoforge-dev/registry").then(({ DirectoryRegistry, serveRegistry }) =>
      serveRegistry(new DirectoryRegistry(dir)),
    )
  : undefined;

const filesOf = async (body) => {
  if (!(body instanceof FormData)) return undefined;
  const { readArchive } = await import("@nanoforge-dev/registry");
  const archive = body.get("archive");
  return archive ? [...readArchive(new Uint8Array(await archive.arrayBuffer())).keys()] : [];
};

globalThis.fetch = async (url, options = {}) => {
  const method = options.method ?? "GET";
  if (log) {
    const authorization = new Headers(options.headers).get("authorization");
    const files = await filesOf(options.body);
    appendFileSync(log, `${JSON.stringify({ method, url: String(url), authorization, files })}\n`);
  }
  if (mockStatus < 200 || mockStatus >= 300)
    return Response.json({ message: "Unauthorized" }, { status: mockStatus });
  if (registry && method === "GET") return registry(url);
  if (String(url).endsWith("/registry/-/whoami"))
    return Response.json({ username: "test", scopes: ["test-org"] });
  return Response.json({ ok: true }, { status: method === "PUT" ? 201 : 200 });
};
