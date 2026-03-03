import { GlobalConfigHandler } from "@lib/global-config";
import { withAuth } from "@lib/http";
import { type Input, getDirectoryInput, getLocalInput, getLoginApiKeyInputOrAsk } from "@lib/input";
import { Messages } from "@lib/ui";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class LoginAction extends AbstractAction {
  protected startMessage = Messages.LOGIN_START;
  protected successMessage = Messages.LOGIN_SUCCESS;
  protected failureMessage = Messages.LOGIN_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const isLocal = getLocalInput(options);
    const apiKey = await getLoginApiKeyInputOrAsk(options);

    await withAuth(apiKey, true).post("/registry-key/verify");

    GlobalConfigHandler.write(
      {
        apiKey,
      },
      isLocal,
      directory,
    );

    return { success: true };
  }
}
