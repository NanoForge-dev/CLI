import config from "@nanoforge-dev/utils-eslint-config";

export default [
  ...config,
  {
    // Moved from the editor, whose lint allows these: `!` after checked lookups, empty `catch {}`.
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
