import { basename, parse } from "path";

export const resolvePackageName = (path: string): string => {
  const { base: baseFilename, dir: dirname } = parse(path);
  if (baseFilename === ".") {
    return basename(process.cwd());
  }
  if (dirname.match(/^@[^\s]/)) {
    return `${dirname}/${baseFilename}`;
  }
  return baseFilename;
};
