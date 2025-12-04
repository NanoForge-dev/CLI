import ora from "ora";

export const getSpinner = (message: string) =>
  ora({
    text: message,
  });
