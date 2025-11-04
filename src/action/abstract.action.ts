import { Input } from "../command";

export abstract class AbstractAction {
  public abstract handle(
    args?: Input,
    options?: Input,
    extraFlags?: string[],
  ): Promise<void>;
}
