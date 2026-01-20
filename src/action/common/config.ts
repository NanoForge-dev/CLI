import { type Config, loadConfig } from "@lib/config";
import { type Input, getConfigInput } from "@lib/input";

export const getConfig = (inputs: Input, dir: string): Promise<Config> => {
  return loadConfig(dir, getConfigInput(inputs));
};
