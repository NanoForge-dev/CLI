import { green } from "ansis";

import { Emojis } from "./emojis";

export const Messages = {
  BUILD_START: "NanoForge Build",
  BUILD_PART_IN_PROGRESS: (part: string) => `Building ${part}...`,
  BUILD_NOTHING: "Nothing to build, terminated.",
  BUILD_SUCCESS: `${Emojis.ROCKET}  Build succeeded !`,
  BUILD_PART_FAILED: (part: string, commandToRunManually: string) =>
    `${Emojis.SCREAM}  Build of ${part} failed !\nIn case you don't see any errors above, consider manually running the failed command ${commandToRunManually} to see more details on why it errored out.`,
  BUILD_FAILED: `${Emojis.SCREAM}  Build failed !`,
  INSTALL_START: "NanoForge Installation",
  INSTALL_NAMES_QUESTION: "Witch libraries do you want to install ?",
  NEW_START: "NanoForge Project Creation",
  NEW_SUCCESS: `${Emojis.ROCKET}  Project successfully created !`,
  NEW_FAILED: `${Emojis.SCREAM}  Project creation failed !`,
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `Installation in progress... ${Emojis.COFFEE}`,
  PACKAGE_MANAGER_INSTALLATION_NOTHING: "Nothing to install, terminated.",
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (names?: string[]) =>
    names
      ? `${Emojis.ROCKET}  Packages successfully installed : ${names.map((name) => green(name)).join(", ")} !`
      : `${Emojis.ROCKET}  Packages successfully installed !`,
  PACKAGE_MANAGER_INSTALLATION_FAILED: (commandToRunManually: string) =>
    `${Emojis.SCREAM}  Packages installation failed !\nIn case you don't see any errors above, consider manually running the failed command ${commandToRunManually} to see more details on why it errored out.`,
  RUN_START: "NanoForge Run",
  RUN_PART_IN_PROGRESS: (part: string) => `Running ${part}...`,
  RUN_PART_SUCCESS: (part: string) => `${Emojis.ROCKET}  Run of ${part} terminated.`,
  RUN_PART_FAILED: (part: string) => `${Emojis.SCREAM}  Run of ${part} failed !`,
  RUNNER_EXECUTION_ERROR: (command: string) => `\nFailed to execute command: ${command}`,
};
