import { green, red, yellow } from "ansis";

const formatLines = (chunk: string | ArrayBuffer): string[] => {
  return chunk
    .toString()
    .replace(/\r\n|\n/g, "\n")
    .replace(/^\n+|\n+$/g, "")
    .split("\n");
};

const timestamp = (): string => yellow(`[${new Date().toISOString()}]`);

export const createStdoutLogger = (name: string) => (chunk: string) => {
  const prefix = green(`(${name}) INFO -`);
  for (const line of formatLines(chunk)) {
    console.info(`${timestamp()} ${prefix} ${line}`);
  }
};

export const createStderrLogger = (name: string) => (chunk: string) => {
  const prefix = red(`(${name}) ERROR -`);
  for (const line of formatLines(chunk)) {
    console.error(`${timestamp()} ${prefix} ${line}`);
  }
};
