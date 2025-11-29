import { Input } from "@lib/input";

export abstract class AbstractAction {
  public abstract handle(args?: Input, options?: Input, extraFlags?: string[]): Promise<void>;
}
