import { type Command } from "commander";

import { type AbstractAction } from "~/action/abstract.action";

export abstract class AbstractCommand {
  constructor(protected action: AbstractAction) {}

  public abstract load(program: Command): void;
}
