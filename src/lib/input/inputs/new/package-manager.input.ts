import { askSelect } from "@lib/question";
import { Messages } from "@lib/ui";

import { getInputOrAsk } from "../../ask-inputs";
import { getStringInput } from "../../base-inputs";
import { Input } from "../../input.type";

const getPackageManagerInput = (inputs: Input) => {
  return getStringInput(inputs, "packageManager");
};

export const getNewPackageManagerInputOrAsk = (inputs: Input) => {
  return getInputOrAsk(getPackageManagerInput(inputs), () =>
    askSelect<"npm" | "yarn" | "pnpm" | "bun">(
      Messages.NEW_PACKAGE_MANAGER_QUESTION,
      [{ value: "npm" }, { value: "yarn" }, { value: "pnpm" }, { value: "bun" }],
      {
        default: "npm",
      },
    ),
  );
};
