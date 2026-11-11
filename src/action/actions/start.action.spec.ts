import { type ClientConfig } from "@nanoforge-dev/config";
import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { type Input } from "@lib/input";

import { CLIError } from "@utils/errors";

import { StartAction } from "./start.action";

interface FullEnvShape {
  client: Record<string, string>;
  server: Record<string, string>;
}

interface TLSOptionsShape {
  cert: string;
  key: string;
}

type ParseEnv = (dir: string) => FullEnvShape;
type ResolveTLS = (options: Input, config: ClientConfig) => TLSOptionsShape | undefined;

const internals = () => {
  const action = new StartAction();
  const cast = action as unknown as { parseEnv: ParseEnv; resolveTLS: ResolveTLS };
  return {
    parseEnv: cast.parseEnv.bind(action),
    resolveTLS: cast.resolveTLS.bind(action),
  };
};

const clientConfig = (tls?: ClientConfig["tls"]): ClientConfig =>
  ({ type: "client", tls }) as unknown as ClientConfig;

describe("StartAction.parseEnv", () => {
  let dir: string;
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    dir = fs.mkdtempSync(join(tmpdir(), "nf-start-env-"));
    savedEnv = { ...process.env };
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("NANOFORGE_")) Reflect.deleteProperty(process.env, key);
    }
  });

  afterEach(() => {
    process.env = savedEnv;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("should only pass NANOFORGE_ variables through, to both sides", () => {
    process.env.NANOFORGE_SHARED = "shared";
    process.env.UNRELATED_VARIABLE = "nope";

    const env = internals().parseEnv(dir);

    expect(env.client).toEqual({ NANOFORGE_SHARED: "shared" });
    expect(env.server).toEqual({ NANOFORGE_SHARED: "shared" });
  });

  it("should strip the CLIENT_ prefix for the client and hide the variable from the server", () => {
    process.env.NANOFORGE_CLIENT_API_URL = "https://example.test";

    const env = internals().parseEnv(dir);

    expect(env.client).toEqual({ NANOFORGE_API_URL: "https://example.test" });
    expect(env.server).toEqual({});
  });

  it("should strip the SERVER_ prefix for the server and hide the variable from the client", () => {
    process.env.NANOFORGE_SERVER_SECRET = "s3cret";

    const env = internals().parseEnv(dir);

    expect(env.server).toEqual({ NANOFORGE_SECRET: "s3cret" });
    expect(env.client).toEqual({});
  });

  it("should drop variables with empty values", () => {
    process.env.NANOFORGE_EMPTY = "";
    process.env.NANOFORGE_SET = "1";

    const env = internals().parseEnv(dir);

    expect(env.client).toEqual({ NANOFORGE_SET: "1" });
    expect(env.server).toEqual({ NANOFORGE_SET: "1" });
  });

  it("should load variables from the project's .env file", () => {
    fs.writeFileSync(join(dir, ".env"), "NANOFORGE_FROM_FILE=file-value\nOTHER=ignored\n");

    const env = internals().parseEnv(dir);

    expect(env.client.NANOFORGE_FROM_FILE).toBe("file-value");
    expect(env.server.NANOFORGE_FROM_FILE).toBe("file-value");
    expect(env.client).not.toHaveProperty("OTHER");
  });

  it("should let the process environment win over the .env file", () => {
    process.env.NANOFORGE_MODE = "process";
    fs.writeFileSync(join(dir, ".env"), "NANOFORGE_MODE=file\n");

    const env = internals().parseEnv(dir);

    expect(env.client.NANOFORGE_MODE).toBe("process");
    expect(env.server.NANOFORGE_MODE).toBe("process");
  });
});

describe("StartAction.resolveTLS", () => {
  it("should return undefined when TLS is not requested anywhere", () => {
    expect(internals().resolveTLS(new Map(), clientConfig())).toBeUndefined();
    expect(
      internals().resolveTLS(
        new Map(),
        clientConfig({ enable: false, cert: "cert.pem", key: "key.pem" }),
      ),
    ).toBeUndefined();
  });

  it("should return the CLI certificate and key when both are given", () => {
    const options: Input = new Map([
      ["cert", { value: "cli-cert.pem" }],
      ["key", { value: "cli-key.pem" }],
    ]);

    expect(internals().resolveTLS(options, clientConfig())).toEqual({
      cert: "cli-cert.pem",
      key: "cli-key.pem",
    });
  });

  it("should fall back to the enabled config TLS pair", () => {
    const config = clientConfig({ enable: true, cert: "cfg-cert.pem", key: "cfg-key.pem" });

    expect(internals().resolveTLS(new Map(), config)).toEqual({
      cert: "cfg-cert.pem",
      key: "cfg-key.pem",
    });
  });

  it("should combine a CLI certificate with the config key", () => {
    const options: Input = new Map([["cert", { value: "cli-cert.pem" }]]);
    const config = clientConfig({ enable: true, cert: "cfg-cert.pem", key: "cfg-key.pem" });

    expect(internals().resolveTLS(options, config)).toEqual({
      cert: "cli-cert.pem",
      key: "cfg-key.pem",
    });
  });

  it("should throw a CLIError when TLS is requested without a certificate", () => {
    const options: Input = new Map([["key", { value: "cli-key.pem" }]]);

    expect(() => internals().resolveTLS(options, clientConfig())).toThrow(CLIError);
    expect(() => internals().resolveTLS(options, clientConfig())).toThrow(
      "No certificate found for TLS.",
    );
  });

  it("should throw a CLIError when TLS is requested without a key", () => {
    const config = clientConfig({ enable: true, cert: "cfg-cert.pem" });

    expect(() => internals().resolveTLS(new Map(), config)).toThrow(CLIError);
    expect(() => internals().resolveTLS(new Map(), config)).toThrow("No key found for TLS.");
  });
});
