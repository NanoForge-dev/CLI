import { describe, expect, it } from "vitest";

import { getLocalBinCommandLoaderUrl } from "./local-binaries";

describe("getLocalBinCommandLoaderUrl", () => {
  it("should build a file URL from a Windows path", () => {
    expect(getLocalBinCommandLoaderUrl("C:\\Users\\me\\my game", true)).toBe(
      "file:///C:/Users/me/my%20game/node_modules/@nanoforge-dev/cli/dist/command.loader.js",
    );
  });

  it("should build a file URL from a POSIX path", () => {
    expect(getLocalBinCommandLoaderUrl("/home/me/my-game", false)).toBe(
      "file:///home/me/my-game/node_modules/@nanoforge-dev/cli/dist/command.loader.js",
    );
  });
});
