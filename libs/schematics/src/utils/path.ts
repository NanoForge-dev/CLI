import { join } from "path";

export const joinRelative = (...paths: [string, ...string[]]): string => {
  const path = join(...paths);
  return path.startsWith("./") || path.startsWith("../") ? path : `./${path}`;
};
