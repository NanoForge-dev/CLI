import { green } from "ansis";

import { Emojis } from "./emojis";

const success = (text: string) => `${Emojis.ROCKET}  ${text}`;
const failure = (text: string) => `${Emojis.SCREAM}  ${text}`;

export const Messages = {
  // --- Build ---
  BUILD_START: "NanoForge Build",
  BUILD_SUCCESS: success("Build succeeded!"),
  BUILD_FAILED: failure("Build failed!"),
  BUILD_WATCH_START: "Watching for changes...",
  BUILD_PART_IN_PROGRESS: (part: string) => `Building ${part}`,
  BUILD_PART_WATCH_IN_PROGRESS: (part: string) => `${part} updated, rebuilding`,
  BUILD_PART_FAILED: (part: string, command: string) =>
    failure(`Build of ${part} failed!\nTry running manually: ${command}`),

  // --- Install ---
  INSTALL_START: "NanoForge Installation",
  INSTALL_SUCCESS: success("Installation completed!"),
  INSTALL_FAILED: failure("Installation failed!"),
  INSTALL_NAMES_QUESTION: "Which libraries do you want to install?",
  INSTALL_PACKAGES_IN_PROGRESS: "Install Nanoforge Packages",

  // --- Login ---
  LOGIN_START: "NanoForge Login",
  LOGIN_SUCCESS: success("Login completed!"),
  LOGIN_FAILED: failure("Login failed!"),
  LOGIN_API_KEY_QUESTION: "What is your registry api key?",

  // --- Logout ---
  LOGOUT_START: "NanoForge Logout",
  LOGOUT_SUCCESS: success("Logout completed!"),
  LOGOUT_FAILED: failure("Logout failed!"),

  // --- New Project ---
  NEW_START: "NanoForge Project Creation",
  NEW_SUCCESS: success("Project successfully created!"),
  NEW_FAILED: failure("Project creation failed!"),
  NEW_NAME_QUESTION: "What is the name of your project?",
  NEW_PACKAGE_MANAGER_QUESTION: "Which package manager do you want to use?",
  NEW_LANGUAGE_QUESTION: "Which language do you want to use?",
  NEW_STRICT_QUESTION: "Do you want to use strict type checking?",
  NEW_SERVER_QUESTION: "Do you want to generate a server for multiplayer?",
  NEW_SKIP_INSTALL_QUESTION: "Do you want to skip dependency installation?",
  NEW_DOCKER_QUESTION: "Do you want to add a Dockerfile for containerization?",

  // --- Create ---
  CREATE_START: "NanoForge Component/System Creation",
  CREATE_SUCCESS: success("Element successfully created!"),
  CREATE_FAILED: failure("Creation failed!"),
  CREATE_NAME_QUESTION: "What is the name of your component/system?",

  // --- Generate ---
  GENERATE_START: "NanoForge Generate",
  GENERATE_SUCCESS: success("Generation succeeded!"),
  GENERATE_FAILED: failure("Generation failed!"),
  GENERATE_WATCH_START: "Watching for changes...",

  // --- Dev ---
  DEV_START: "NanoForge Dev Mode",
  DEV_SUCCESS: "Dev mode ended",
  DEV_FAILED: failure("Dev mode failed!"),

  // --- Start ---
  START_START: "NanoForge Start",
  START_SUCCESS: success("Start completed!"),
  START_FAILED: failure("Start failed!"),
  START_PART_IN_PROGRESS: (part: string) => `Starting ${part}...`,
  START_PART_SUCCESS: (part: string) => success(`${part} terminated.`),
  START_PART_FAILED: (part: string) => failure(`${part} failed!`),

  // --- Publish ---
  PUBLISH_START: "NanoForge Publish",
  PUBLISH_SUCCESS: success("Publish completed!"),
  PUBLISH_FAILED: failure("Publish failed!"),
  PUBLISH_IN_PROGRESS: (name: string) => `Publishing ${name}...`,

  // --- Unpublish ---
  UNPUBLISH_START: "NanoForge Unpublish",
  UNPUBLISH_SUCCESS: success("Unpublish completed!"),
  UNPUBLISH_FAILED: failure("Unpublish failed!"),
  UNPUBLISH_IN_PROGRESS: (name: string) => `Unpublishing ${name}...`,

  // --- Schematics ---
  SCHEMATICS_START: "Running schematics",
  SCHEMATIC_IN_PROGRESS: (name: string) => `Generating ${name}...`,
  SCHEMATIC_WATCH_IN_PROGRESS: (name: string) => `Change detected, regenerating ${name}...`,
  SCHEMATIC_SUCCESS: (name: string) => success(`${name} generated successfully!`),
  SCHEMATIC_FAILED: (name: string) => failure(`${name} generation failed.`),

  // --- Package Manager ---
  PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS: `Installing dependencies... ${Emojis.COFFEE}`,
  PACKAGE_MANAGER_INSTALLATION_NOTHING: "Nothing to install.",
  PACKAGE_MANAGER_INSTALLATION_SUCCEED: (names?: string[]) =>
    names
      ? success(`Packages installed: ${names.map((n) => green(n)).join(", ")}`)
      : success("Packages installed!"),
  PACKAGE_MANAGER_INSTALLATION_FAILED: (command: string) =>
    failure(`Package installation failed!\nTry running manually: ${command}`),

  // --- Runner ---
  RUNNER_EXECUTION_ERROR: (command: string) => `\nFailed to execute command: ${command}`,
};
