const PREFIX = "NANOFORGE_";

export const getGameEnv = () => {
  return Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => key.startsWith(PREFIX))
      .map(([key, value]) => [key.replace(PREFIX, ""), value]),
  );
};
