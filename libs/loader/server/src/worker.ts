import { createRequire } from "node:module";

import { getGameEnv } from "./env";

const bootstrap = async () => {
  const mainPath = process.argv[2] as string;
  const paths = JSON.parse(process.argv[3] as string);
  const { main } = (await createRequire(import.meta.url)(mainPath)) as {
    main: (options: {
      files: Map<string, string>;
      env: Record<string, string | undefined>;
    }) => Promise<void>;
  };

  console.log("Starting server");
  await main({ files: new Map(paths), env: getGameEnv() });
};

bootstrap().then();
