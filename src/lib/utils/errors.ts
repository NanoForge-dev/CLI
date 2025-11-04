export const promptError = (err: Error) => {
  if (err.name === "ExitPromptError") {
    process.exit(1);
  } else {
    throw err;
  }
};
