import { Logger } from "./utils/logger.utils";

const logger = new Logger("Env");

export const getEnv = async (): Promise<Record<string, string | undefined>> => {
  logger.info("Fetching environment");
  const res = await fetch("/env");
  if (!res.ok) throw new Error("Unable to fetch env");
  const content = await res.json();
  logger.info("Environment fetched!");
  return content as Record<string, string | undefined>;
};
