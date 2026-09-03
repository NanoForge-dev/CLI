import { describe, expect, it } from "vitest";

import { ConfigDeclarator } from "./config.declarator";

describe("ConfigDeclarator", () => {
  it("should return a valid JSON string", () => {
    const result = new ConfigDeclarator().declare("{}", {});
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("should include default client config", () => {
    const result = JSON.parse(new ConfigDeclarator().declare("{}", {}));
    expect(result.client).toBeUndefined();
  });

  it("should not include server config when server is not enabled", () => {
    const result = JSON.parse(new ConfigDeclarator().declare("{}", {}));
    expect(result.server).toBeUndefined();
  });

  it("should format output with 2-space indentation", () => {
    const result = new ConfigDeclarator().declare('{ "server": { "enable": true } }', {});
    expect(result).toContain("\n  ");
  });

  it("should include server config when baseContent has server.enable true", () => {
    const baseContent = JSON.stringify({ server: { enable: true } });
    const result = JSON.parse(new ConfigDeclarator().declare(baseContent, {}));
    expect(result.server).toBeDefined();
    expect(result.server.enable).toBe(true);
  });

  it("should include server config when options has server.enable true", () => {
    const result = JSON.parse(new ConfigDeclarator().declare("{}", { server: { enable: true } }));
    expect(result.server).toBeDefined();
    expect(result.server.enable).toBe(true);
  });
});
