import { type ClientConfig } from "@nanoforge-dev/config";
import fs from "fs";
import { tmpdir } from "os";
import { join, relative } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseWorkspaceConfig, resolveProjects } from "@lib/config";
import { type Input } from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";

import { CLIError } from "@utils/errors";

import { StartAction } from "./start.action";

vi.mock("@lib/config", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  parseWorkspaceConfig: vi.fn(),
  resolveProjects: vi.fn(),
}));

vi.mock("@lib/package-manager", () => ({
  PackageManagerFactory: { find: vi.fn() },
}));

interface FullEnvShape {
  client: Record<string, string>;
  server: Record<string, string>;
}

interface TLSOptionsShape {
  cert: string;
  key: string;
}

type ParseEnv = (dir: string) => FullEnvShape;
type ResolveTLS = (
  options: Input,
  config: ClientConfig,
  directory: string,
) => TLSOptionsShape | undefined;

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
  let cwdFiles: string;
  let project: string;

  const tls = (options: Input, config: ClientConfig) =>
    internals().resolveTLS(options, config, project);

  beforeEach(() => {
    cwdFiles = fs.mkdtempSync(join(tmpdir(), "nf-start-tls-cwd-"));
    project = fs.mkdtempSync(join(tmpdir(), "nf-start-tls-project-"));
    for (const dir of [cwdFiles, project]) {
      fs.writeFileSync(join(dir, "cert.pem"), "cert");
      fs.writeFileSync(join(dir, "key.pem"), "key");
    }
  });

  afterEach(() => {
    fs.rmSync(cwdFiles, { recursive: true, force: true });
    fs.rmSync(project, { recursive: true, force: true });
  });

  /** A flag as the user types it: relative to the working directory. */
  const flag = (file: string) => relative(process.cwd(), join(cwdFiles, file));

  it("should return undefined when TLS is not requested anywhere", () => {
    expect(tls(new Map(), clientConfig())).toBeUndefined();
    expect(
      tls(new Map(), clientConfig({ enable: false, cert: "cert.pem", key: "key.pem" })),
    ).toBeUndefined();
  });

  it("should resolve relative --cert and --key against the working directory", () => {
    const options: Input = new Map([
      ["cert", { value: flag("cert.pem") }],
      ["key", { value: flag("key.pem") }],
    ]);

    expect(tls(options, clientConfig())).toEqual({
      cert: join(cwdFiles, "cert.pem"),
      key: join(cwdFiles, "key.pem"),
    });
  });

  it("should resolve relative config paths against the project folder", () => {
    const config = clientConfig({ enable: true, cert: "cert.pem", key: "./key.pem" });

    expect(tls(new Map(), config)).toEqual({
      cert: join(project, "cert.pem"),
      key: join(project, "key.pem"),
    });
  });

  it("should keep absolute paths", () => {
    const config = clientConfig({
      enable: true,
      cert: join(cwdFiles, "cert.pem"),
      key: join(cwdFiles, "key.pem"),
    });

    expect(tls(new Map(), config)).toEqual({
      cert: join(cwdFiles, "cert.pem"),
      key: join(cwdFiles, "key.pem"),
    });
  });

  it("should combine a CLI certificate with the config key", () => {
    const options: Input = new Map([["cert", { value: flag("cert.pem") }]]);
    const config = clientConfig({ enable: true, cert: "missing.pem", key: "key.pem" });

    expect(tls(options, config)).toEqual({
      cert: join(cwdFiles, "cert.pem"),
      key: join(project, "key.pem"),
    });
  });

  it("should throw a CLIError naming the file when the certificate or key does not exist", () => {
    const config = clientConfig({ enable: true, cert: "cert.pem", key: "nope.pem" });

    expect(() => tls(new Map(), config)).toThrow(CLIError);
    expect(() => tls(new Map(), config)).toThrow(join(project, "nope.pem"));
  });

  it("should throw a CLIError when TLS is requested without a certificate", () => {
    const options: Input = new Map([["key", { value: flag("key.pem") }]]);

    expect(() => tls(options, clientConfig())).toThrow(CLIError);
    expect(() => tls(options, clientConfig())).toThrow("No certificate found for TLS.");
  });

  it("should throw a CLIError when TLS is requested without a key", () => {
    const config = clientConfig({ enable: true, cert: "cert.pem" });

    expect(() => tls(new Map(), config)).toThrow(CLIError);
    expect(() => tls(new Map(), config)).toThrow("No key found for TLS.");
  });
});

describe("StartAction.handle", () => {
  const run = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(parseWorkspaceConfig).mockResolvedValue({ type: "workspace", config: {} } as any);
    vi.mocked(resolveProjects).mockReturnValue([
      { directory: "client", config: { type: "client" } },
      { directory: "server", config: { type: "server" } },
    ] as any);
    vi.mocked(PackageManagerFactory.find).mockResolvedValue({ run } as any);
    vi.spyOn(process, "once").mockImplementation((() => process) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const start = () =>
    new StartAction().handle(new Map(), new Map([["watch", { value: true }]]) as Input);

  it("fails as soon as one loader fails, without waiting for the other", async () => {
    run.mockImplementation((name: string) =>
      name === "Client" ? Promise.resolve(false) : new Promise(() => undefined),
    );

    await expect(start()).resolves.toMatchObject({ keepAlive: true, success: false });
  });

  it("keeps running while the loaders run, and ends cleanly when they all end", async () => {
    run.mockResolvedValue(true);

    await expect(start()).resolves.toEqual({ keepAlive: true });
  });
});
