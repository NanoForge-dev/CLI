import { type Config, loadConfig } from "@lib/config";
import { type Input, getConfigInput } from "@lib/input";

export const getConfig = (inputs: Input, dir: string, noThrow?: boolean): Promise<Config> => {
  return loadConfig(dir, getConfigInput(inputs), noThrow);
};
