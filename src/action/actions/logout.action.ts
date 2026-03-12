import { GlobalConfigHandler } from "@lib/global-config";
import { type Input, getDirectoryInput, getLocalInput } from "@lib/input";
import { Messages } from "@lib/ui";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class LogoutAction extends AbstractAction {
  protected startMessage = Messages.LOGOUT_START;
  protected successMessage = Messages.LOGOUT_SUCCESS;
  protected failureMessage = Messages.LOGOUT_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const isLocal = getLocalInput(options);

    GlobalConfigHandler.write(
      {
        apiKey: undefined,
      },
      isLocal,
      directory,
    );

    return { success: true };
  }
}
