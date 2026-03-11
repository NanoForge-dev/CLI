import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MANIFEST_FILE_NAME } from "@lib/constants";

import { deepMerge } from "@utils/object";

import { Manifest } from "./manifest.type";

const getManifestPath = (directory: string) => {
  for (const n of [MANIFEST_FILE_NAME]) {
    const path = join(directory, n);
    if (existsSync(path)) return path;
  }
  throw new Error(`No manifest file found in directory: ${directory}`);
};

export const loadManifest = async (directory: string): Promise<Manifest> => {
  let rawData;

  const path = getManifestPath(directory);
  try {
    rawData = deepMerge({}, JSON.parse(readFileSync(path, "utf-8")));
  } catch {
    rawData = null;
  }
  if (!rawData) throw new Error(`Not able to read manifest file : ${path}`);

  const data = plainToInstance(Manifest, rawData, {
    excludeExtraneousValues: true,
  });

  const errors = await validate(data);
  if (errors.length > 0)
    throw new Error(`Invalid manifest\n${errors.toString().replace(/,/g, "\n")}`);
  return data;
};
