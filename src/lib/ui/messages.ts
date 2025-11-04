import { green } from "ansis";

import { Emojis } from "./emojis";

export const Messages = {
  INSTALL_START: "NanoForge Installation",
  INSTALL_NAMES_QUESTION: "Witch libraries do you want to install ?",
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `Installation in progress... ${Emojis.COFFEE}`,
  PACKAGE_MANAGER_INSTALLATION_NOTHING: "Nothing to install, terminated.",
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (names?: string[]) =>
    names
      ? `${Emojis.ROCKET}  Packages successfully installed : ${names.map((name) => green(name)).join(", ")} !`
      : `${Emojis.ROCKET}  Packages successfully installed !`,
  PACKAGE_MANAGER_INSTALLATION_FAILED: (commandToRunManually: string) =>
    `${Emojis.SCREAM}  Packages installation failed !\nIn case you don't see any errors above, consider manually running the failed command ${commandToRunManually} to see more details on why it errored out.`,
  RUNNER_EXECUTION_ERROR: (command: string) =>
    `\nFailed to execute command: ${command}`,
};
