import { IInput } from "../command";

export abstract class AbstractAction {
  public abstract handle(
    inputs?: IInput[],
    options?: IInput[],
    extraFlags?: string[],
  ): Promise<void>;
}
