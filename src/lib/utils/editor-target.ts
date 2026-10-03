import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

export interface EditorTarget {
  /** Folder the editor may open projects in (`FS_ROOT` of the editor). */
  fsRoot: string;
  /** Project to open, relative to `fsRoot` (`.` for `fsRoot` itself). */
  projectPath?: string;
}

/**
 * Where `nf editor [path]` roots the editor: the working directory, or the project's parent
 * folder when the project is outside of it.
 */
export const resolveEditorTarget = (directory: string, path?: string): EditorTarget => {
  const fsRoot = resolve(directory);
  if (!path) return { fsRoot };
  const project = resolve(fsRoot, path);
  const inside = relative(fsRoot, project);
  if (!inside.startsWith("..") && !isAbsolute(inside)) {
    return { fsRoot, projectPath: inside || "." };
  }
  return { fsRoot: dirname(project), projectPath: basename(project) };
};

/** URL the browser opens: the project when there is one, the project list otherwise. */
export const editorUrl = (port: number, target: EditorTarget): string => {
  const base = `http://localhost:${port}`;
  return target.projectPath === undefined
    ? base
    : `${base}/load?path=${encodeURIComponent(target.projectPath)}`;
};
