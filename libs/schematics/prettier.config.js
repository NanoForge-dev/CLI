import prettierConfig from "@nanoforge-dev/utils-prettier-config";

export default {
  ...prettierConfig,
  importOrder: ["^@utils/(.*)$", "^~/(.*)$", "^[./]"],
};
