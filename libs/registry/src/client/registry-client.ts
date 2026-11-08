import semver from "semver";

import { MAX_ARCHIVE_BYTES } from "../archive/archive";
import {
  ItemName,
  ItemVersion,
  type RegistryItem,
  SearchQuery,
  type SearchResult,
} from "../item/item.schema";
import { RegistryError } from "../registry/registry.exception";
import type { Registry, RegistryErrorCode } from "../registry/registry.type";
import { fromPackument, fromSearchObject } from "../wire/packument";
import { Packument, ROUTES, WireSearch, WireWhoami } from "../wire/wire.schema";

const ABBREVIATED = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8";
/** Statuses whose `location` is followed, and how many redirects in a row at most. */
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
/** Redirects that keep the method and the body: the only ones a write follows. */
const SAME_METHOD_REDIRECTS = new Set([307, 308]);
/** What a write's refusal means (the contract's statuses); others are `UNAVAILABLE`. */
const WRITE_ERRORS: Record<number, RegistryErrorCode> = {
  400: "INVALID",
  401: "INVALID",
  403: "INVALID",
  409: "CONFLICT",
  413: "INVALID",
};

/** A request with a `method` reads the reason of a refusal (writes, and `whoami`). */
interface RequestInitOptions {
  readonly method?: "GET" | "PUT" | "DELETE";
  readonly body?: FormData;
}

export interface RegistryClientOptions {
  /** Base URL of the API holding `/registry/…`. */
  readonly baseUrl: string;
  readonly fetch?: typeof fetch;
  /** Headers of every request (reading needs none; a registry key to publish). */
  readonly headers?: () => Record<string, string>;
  /** How long a request may take (default 60 s). */
  readonly timeoutMs?: number;
  /**
   * Other origins the registry may keep archives on (`https://cdn.example.com`). Every request,
   * redirects included, goes to the registry's own origin or to one of these, never elsewhere.
   */
  readonly archiveOrigins?: readonly string[];
}

/** The registry over HTTP (the contract of `docs/api/registry.md`). */
export class RegistryClient implements Registry {
  constructor(private readonly _options: RegistryClientOptions) {}

  async search(query: SearchQuery = {}): Promise<SearchResult> {
    const { type, q, page, limit } = SearchQuery.parse(query);
    const params = new URLSearchParams({
      text: q,
      from: String((page - 1) * limit),
      size: String(limit),
    });
    if (type) params.set("type", type);
    const response = await this._request(`${ROUTES.search}?${params}`);
    const found = this._parse(WireSearch, await this._json(response));
    return { items: found.objects.map(fromSearchObject), total: found.total };
  }

  async get(name: string): Promise<RegistryItem> {
    return fromPackument(await this._packument(name), semver.rcompare);
  }

  async download(name: string, version: string): Promise<Uint8Array> {
    const found = (await this._packument(name, true)).versions[version];
    if (!found) throw new RegistryError("NOT_FOUND", `${name}@${version} was not found`);
    const subject = `${name}@${version}`;
    const response = await this._request(found.dist.tarball, subject);
    const limit = Math.min(found.dist.size ?? MAX_ARCHIVE_BYTES, MAX_ARCHIVE_BYTES);
    const bytes = await readLimited(response, limit, subject);
    if (found.dist.size !== undefined && bytes.length !== found.dist.size)
      throw new RegistryError("INTEGRITY", `${subject} does not have the size the registry says`);
    return bytes;
  }

  /**
   * Publishes a version: `archive` is a zip with `nanoforge.manifest.json` at its root, naming
   * `name` (the registry moves `latest` when the version is the highest stable one). Needs a
   * registry key in `headers`.
   * Rejects with `CONFLICT` when the version exists or existed, `INVALID` when the registry
   * refuses the archive or the key.
   */
  async publish(name: string, archive: Uint8Array): Promise<void> {
    checkName(name);
    const body = new FormData();
    body.append("archive", new Blob([archive as BlobPart]), `${name.split("/")[1]}.zip`);
    await this._request(ROUTES.item(name), name, {}, { method: "PUT", body });
  }

  /**
   * Unpublishes a version: its archive is deleted, and its number can never be published again.
   * Needs a registry key in `headers`. Rejects with `NOT_FOUND` for an unknown version.
   */
  async unpublish(name: string, version: string): Promise<void> {
    checkName(name);
    if (!ItemVersion.safeParse(version).success)
      throw new RegistryError("INVALID", `${version} is not a valid version`);
    await this._request(
      ROUTES.archive(name, version),
      `${name}@${version}`,
      {},
      {
        method: "DELETE",
      },
    );
  }

  /** Who the registry key in `headers` belongs to, and the scopes it may publish in. */
  async whoami(): Promise<WireWhoami> {
    const response = await this._request(ROUTES.whoami, "whoami", {}, { method: "GET" });
    return this._parse(WireWhoami, await this._json(response));
  }

  /**
   * The document of an item. `abbreviated` asks for what installing needs (npm's
   * `application/vnd.npm.install-v1+json`): versions without their contents nor the readme.
   */
  private async _packument(name: string, abbreviated = false): Promise<Packument> {
    const response = await this._request(
      ROUTES.item(name),
      name,
      abbreviated ? { accept: ABBREVIATED } : {},
    );
    return this._parse(Packument, await this._json(response));
  }

  /**
   * A request to the registry, or to where it keeps an archive (`archiveOrigins`): http(s) only,
   * never to another origin, and the registry's headers only go to the registry's own origin.
   * Redirects are followed here, so that each address they lead to is checked.
   */
  private async _request(
    path: string,
    subject?: string,
    headers: Record<string, string> = {},
    { method, body }: RequestInitOptions = {},
  ): Promise<Response> {
    const base = new URL(this._options.baseUrl);
    const signal = AbortSignal.timeout(this._options.timeoutMs ?? 60_000);
    const allowed = new Set([
      base.origin,
      ...(this._options.archiveOrigins ?? []).map((origin) => new URL(origin).origin),
    ]);
    let url = new URL(path, base);
    let response: Response;
    for (let redirects = 0; ; redirects++) {
      if (url.protocol !== "https:" && url.protocol !== "http:")
        throw new RegistryError(
          "INVALID",
          `The registry gave an address that is not http(s): ${url.protocol}`,
        );
      if (!allowed.has(url.origin))
        throw new RegistryError(
          "INVALID",
          `The registry gave an address on another origin (${url.origin})`,
        );
      try {
        response = await (this._options.fetch ?? fetch)(url.toString(), {
          headers: {
            ...headers,
            ...(url.origin === base.origin ? this._options.headers?.() : {}),
          },
          redirect: "manual",
          signal,
          ...(method && { method }),
          ...(body && { body }),
        });
      } catch (error) {
        throw new RegistryError(
          "UNAVAILABLE",
          `The registry cannot be reached: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      const location = REDIRECTS.has(response.status) ? response.headers.get("location") : null;
      if (location === null) break;
      if (method && method !== "GET" && !SAME_METHOD_REDIRECTS.has(response.status))
        throw new RegistryError(
          "UNAVAILABLE",
          `The registry answered ${response.status} to a ${method}`,
        );
      if (redirects >= MAX_REDIRECTS)
        throw new RegistryError("UNAVAILABLE", "The registry redirected too many times");
      url = new URL(location, url);
      // A write's body (an archive not published yet) never goes to another origin.
      if (method && method !== "GET" && url.origin !== base.origin)
        throw new RegistryError(
          "UNAVAILABLE",
          `The registry redirected a ${method} to another origin (${url.origin})`,
        );
    }
    if (response.status === 404) {
      throw subject
        ? new RegistryError("NOT_FOUND", `${subject} was not found`)
        : new RegistryError("UNAVAILABLE", "This registry does not answer searches yet");
    }
    if (!response.ok && method) {
      const reason = reasonOf(await this._json(response));
      const refused = response.status === 401 || response.status === 403;
      throw new RegistryError(
        WRITE_ERRORS[response.status] ?? "UNAVAILABLE",
        `${refused ? "The registry refused the key" : "The registry refused the request"}` +
          ` (${response.status})${reason ? `: ${reason}` : ""}`,
      );
    }
    if (!response.ok)
      throw new RegistryError("UNAVAILABLE", `The registry answered ${response.status}`);
    return response;
  }

  private async _json(response: Response): Promise<unknown> {
    try {
      return (await response.json()) as unknown;
    } catch {
      return undefined;
    }
  }

  private _parse<T>(
    schema: { safeParse(value: unknown): { success: boolean; data?: T } },
    value: unknown,
  ): T {
    const parsed = schema.safeParse(value);
    if (!parsed.success)
      throw new RegistryError(
        "UNAVAILABLE",
        "The registry sent an answer this version cannot read",
      );
    return parsed.data as T;
  }
}

const checkName = (name: string): void => {
  if (!ItemName.safeParse(name).success)
    throw new RegistryError("INVALID", `${name} is not a valid name`);
};

/** The reason an error body gives (`{ message }`, NestJS's `{ message: [...] }`, `{ error }`). */
const reasonOf = (body: unknown): string | undefined => {
  if (typeof body !== "object" || body === null) return undefined;
  const { message, error } = body as { message?: unknown; error?: unknown };
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every((part) => typeof part === "string"))
    return message.join(", ");
  return typeof error === "string" ? error : undefined;
};

/** The body of a response, stopped as soon as it passes `limit` bytes. */
const readLimited = async (
  response: Response,
  limit: number,
  subject: string,
): Promise<Uint8Array> => {
  const declared = Number(response.headers.get("content-length") ?? NaN);
  const tooLarge = () => new RegistryError("INVALID", `${subject} is larger than allowed`);
  if (declared > limit) throw tooLarge();
  if (!response.body) return new Uint8Array(await response.arrayBuffer());
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch (error) {
      throw new RegistryError(
        "UNAVAILABLE",
        `The download of ${subject} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (chunk.done) break;
    total += chunk.value.length;
    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      throw tooLarge();
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
};
