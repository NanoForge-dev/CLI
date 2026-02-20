import { type Command } from "commander";

import { type Input, type InputValue } from "@lib/input";

import { type AbstractAction } from "~/action/abstract.action";

export abstract class AbstractCommand {
  constructor(protected action: AbstractAction) {}

  public abstract load(program: Command): void;

  protected static mapToInput(mapping: Record<string, InputValue["value"]>): Input {
    const input: Input = new Map();
    for (const [key, value] of Object.entries(mapping)) {
      input.set(key, { value });
    }
    return input;
  }
}
