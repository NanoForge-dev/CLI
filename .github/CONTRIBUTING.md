# Contributing

If you wish to contribute to the NanoForge project, fork the repository and submit a pull request. Please mind following the pre-commit hooks to keep the codebase as clean as possible.

## Setup

To get ready to work on the codebase, please do the following:

1. Fork & clone the repository, and make sure you're on the **main** branch
2. Run `pnpm install --frozen-lockfile` ([install](https://pnpm.io/installation))
3. Make your changes
4. Run `pnpm format && pnpm build && pnpm test:unit` to run ESLint/Prettier, build and tests
5. [Submit a pull request](https://github.com/NanoForge-dev/CLI/compare) (Make sure you follow the [conventional commit format](https://github.com/NanoForge-dev/CLI/blob/main/.github/COMMIT_CONVENTION.md))
