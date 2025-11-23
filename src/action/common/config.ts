import { Config, loadConfig } from "@lib/config";
import { Input, getConfigInput } from "@lib/input";

export const getConfig = (inputs: Input, dir: string): Promise<Config> => {
  return loadConfig(dir, getConfigInput(inputs));
};
