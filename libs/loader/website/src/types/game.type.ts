export interface IGameOptions {
  container: HTMLDivElement;
  files: Map<string, string>;
  env: Record<string, string | undefined>;
}
