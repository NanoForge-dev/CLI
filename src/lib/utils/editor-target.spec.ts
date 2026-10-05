import { describe, expect, it } from "vitest";

import { editorUrl, resolveEditorTarget } from "./editor-target";

describe("resolveEditorTarget", () => {
  it("roots the editor in the working directory", () => {
    expect(resolveEditorTarget("/work")).toEqual({ fsRoot: "/work" });
    expect(resolveEditorTarget("/work", "games/pong")).toEqual({
      fsRoot: "/work",
      projectPath: "games/pong",
    });
    expect(resolveEditorTarget("/work", ".")).toEqual({ fsRoot: "/work", projectPath: "." });
  });

  it("roots the editor in the parent of a project outside of it", () => {
    expect(resolveEditorTarget("/work", "/other/pong")).toEqual({
      fsRoot: "/other",
      projectPath: "pong",
    });
    expect(resolveEditorTarget("/work/a", "../b")).toEqual({ fsRoot: "/work", projectPath: "b" });
  });
});

describe("editorUrl", () => {
  it("opens the project when there is one", () => {
    expect(editorUrl(5173, { fsRoot: "/work", projectPath: "games/pong" })).toBe(
      "http://localhost:5173/load?path=games%2Fpong",
    );
    expect(editorUrl(4000, { fsRoot: "/work" })).toBe("http://localhost:4000");
  });
});
