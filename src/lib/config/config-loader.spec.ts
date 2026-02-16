import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { existsSync, readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("class-transformer", () => ({
  plainToInstance: vi.fn(),
  Expose: () => () => {},
  Type: () => () => {},
}));

vi.mock("class-validator", () => ({
  validate: vi.fn(),
  IsBoolean: () => () => {},
  IsEnum: () => () => {},
  IsNotEmpty: () => () => {},
  IsPort: () => () => {},
  IsString: () => () => {},
  ValidateNested: () => () => {},
}));

describe("loadConfig", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("should load config from a named file", async () => {
    const rawConfig = { name: "test-app", language: "ts" };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(rawConfig));
    vi.mocked(plainToInstance).mockReturnValue(rawConfig as any);
    vi.mocked(validate).mockResolvedValue([]);

    const { loadConfig: freshLoad } = await import("./config-loader");
    const result = await freshLoad("/project", "custom.json");

    expect(readFileSync).toHaveBeenCalledWith("/project/custom.json", "utf-8");
    expect(result).toEqual(rawConfig);
  });

  it("should search for nanoforge.config.json when no name provided", async () => {
    const rawConfig = { name: "my-app" };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(rawConfig));
    vi.mocked(plainToInstance).mockReturnValue(rawConfig as any);
    vi.mocked(validate).mockResolvedValue([]);

    const { loadConfig: freshLoad } = await import("./config-loader");
    const result = await freshLoad("/project");

    expect(existsSync).toHaveBeenCalled();
    expect(result).toEqual(rawConfig);
  });

  it("should throw when no config file is found", async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const { loadConfig: freshLoad } = await import("./config-loader");

    await expect(freshLoad("/project")).rejects.toThrow("Unsupported config");
  });

  it("should throw when config file cannot be parsed", async () => {
    vi.mocked(readFileSync).mockReturnValue("invalid json");
    vi.mocked(existsSync).mockReturnValue(true);

    const { loadConfig: freshLoad } = await import("./config-loader");

    await expect(freshLoad("/project")).rejects.toThrow("Not able to read config file");
  });

  it("should throw on validation errors", async () => {
    const rawConfig = { name: "" };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(rawConfig));
    vi.mocked(plainToInstance).mockReturnValue(rawConfig as any);
    vi.mocked(validate).mockResolvedValue([
      { property: "name", toString: () => "name must not be empty" } as any,
    ]);

    const { loadConfig: freshLoad } = await import("./config-loader");

    await expect(freshLoad("/project")).rejects.toThrow("Invalid config");
  });

  it("should cache config after first load", async () => {
    const rawConfig = { name: "cached-app" };
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(rawConfig));
    vi.mocked(plainToInstance).mockReturnValue(rawConfig as any);
    vi.mocked(validate).mockResolvedValue([]);

    const { loadConfig: freshLoad } = await import("./config-loader");

    await freshLoad("/project");
    await freshLoad("/project");

    expect(readFileSync).toHaveBeenCalledTimes(1);
  });
});
