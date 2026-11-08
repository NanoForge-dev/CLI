import { describe, expect, it } from "vitest";

import { RegistryClient, RegistryError } from "../../src";

interface Seen {
  readonly url: string;
  readonly method: string;
  readonly authorization: string | null;
  readonly body: BodyInit | null | undefined;
}

/** A client whose `fetch` records each request and answers with `answer`. */
const clientWith = (answer: (seen: Seen) => Response) => {
  const seen: Seen[] = [];
  const client = new RegistryClient({
    baseUrl: "https://api.test",
    headers: () => ({ authorization: "Bearer secret" }),
    fetch: (async (input: string, init?: RequestInit) => {
      const request = {
        url: input,
        method: init?.method ?? "GET",
        authorization: new Headers(init?.headers).get("authorization"),
        body: init?.body,
      };
      seen.push(request);
      return answer(request);
    }) as typeof fetch,
  });
  return { client, seen };
};

describe("RegistryClient writes", () => {
  it("publishes the archive as the multipart field `archive`, with the key", async () => {
    const { client, seen } = clientWith(() => Response.json({ ok: true }, { status: 201 }));
    const archive = new Uint8Array([80, 75, 3, 4]);

    await client.publish("@acme/kit", archive);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      url: "https://api.test/registry/@acme/kit",
      method: "PUT",
      authorization: "Bearer secret",
    });
    const body = seen[0]!.body as FormData;
    const file = body.get("archive") as File;
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(archive);
    expect(file.name).toBe("kit.zip");
  });

  it("unpublishes a version by deleting its archive", async () => {
    const { client, seen } = clientWith(() => Response.json({ ok: true }));

    await client.unpublish("@acme/kit", "1.2.0");

    expect(seen).toEqual([
      expect.objectContaining({
        url: "https://api.test/registry/@acme/kit/-/kit-1.2.0.zip",
        method: "DELETE",
        authorization: "Bearer secret",
      }),
    ]);
  });

  it("says who the key belongs to", async () => {
    const { client, seen } = clientWith(() =>
      Response.json({ username: "acme", scopes: ["acme"] }),
    );

    expect(await client.whoami()).toEqual({ username: "acme", scopes: ["acme"] });
    expect(seen[0]).toMatchObject({ url: "https://api.test/registry/-/whoami" });
  });

  it.each([
    [409, "CONFLICT", "1.2.0 was already published"],
    [400, "INVALID", "nanoforge.manifest.json names another package"],
    [413, "INVALID", "too large"],
    [401, "INVALID", "expired key"],
    [403, "INVALID", "not your scope"],
    [500, "UNAVAILABLE", "boom"],
  ])("turns a %i into %s, with the registry's reason", async (status, code, reason) => {
    const { client } = clientWith(() =>
      Response.json({ statusCode: status, message: reason }, { status }),
    );

    const error = await client.publish("@acme/kit", new Uint8Array()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RegistryError);
    expect(error).toMatchObject({ code, message: expect.stringContaining(reason) });
  });

  it("says the key was refused on a 401 from whoami", async () => {
    const { client } = clientWith(() => Response.json({ message: "no key" }, { status: 401 }));

    await expect(client.whoami()).rejects.toMatchObject({
      code: "INVALID",
      message: expect.stringContaining("refused the key"),
    });
  });

  it("reads NestJS's list of messages", async () => {
    const { client } = clientWith(() =>
      Response.json({ message: ["a is wrong", "b is wrong"] }, { status: 400 }),
    );

    await expect(client.publish("@acme/kit", new Uint8Array())).rejects.toThrow(
      "a is wrong, b is wrong",
    );
  });

  it("reports an unknown version on unpublish as NOT_FOUND", async () => {
    const { client } = clientWith(() => Response.json({ error: "nope" }, { status: 404 }));

    await expect(client.unpublish("@acme/kit", "9.9.9")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("follows a 307 on a write with the same method and body, and refuses a 302", async () => {
    const { client, seen } = clientWith(({ url }) =>
      url === "https://api.test/registry/@acme/kit"
        ? new Response(null, { status: 307, headers: { location: "/v2/registry/@acme/kit" } })
        : new Response(null, { status: 201 }),
    );

    await client.publish("@acme/kit", new Uint8Array([1]));
    expect(seen.map(({ url, method }) => [url, method])).toEqual([
      ["https://api.test/registry/@acme/kit", "PUT"],
      ["https://api.test/v2/registry/@acme/kit", "PUT"],
    ]);
    expect(seen[1]!.body).toBe(seen[0]!.body);

    const moved = clientWith(
      () => new Response(null, { status: 302, headers: { location: "/elsewhere" } }),
    );
    await expect(moved.client.unpublish("@acme/kit", "1.0.0")).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
    expect(moved.seen).toHaveLength(1);
  });

  it("refuses a 307 or 308 on a write that leads to another origin", async () => {
    for (const status of [307, 308]) {
      const { client, seen } = clientWith(({ url }) =>
        url.startsWith("https://api.test/")
          ? new Response(null, { status, headers: { location: "https://elsewhere.test/upload" } })
          : new Response(null, { status: 201 }),
      );

      await expect(client.publish("@acme/kit", new Uint8Array([1]))).rejects.toMatchObject({
        code: "UNAVAILABLE",
        message: expect.stringContaining("another origin"),
      });
      expect(seen.map(({ url }) => url)).toEqual(["https://api.test/registry/@acme/kit"]);
    }
  });

  it("refuses an invalid name or version before any request", async () => {
    const { client, seen } = clientWith(() => new Response(null, { status: 201 }));

    await expect(client.publish("acme/kit", new Uint8Array())).rejects.toMatchObject({
      code: "INVALID",
    });
    await expect(client.unpublish("@acme/kit", "../1")).rejects.toMatchObject({
      code: "INVALID",
    });
    expect(seen).toHaveLength(0);
  });
});
