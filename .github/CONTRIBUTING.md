# Contributing

If you wish to contribute to the NanoForge project, fork the repository and submit a pull request. Please mind following the pre-commit hooks to keep the codebase as clean as possible.

## Repository structure

This repository is a [pnpm workspace](https://pnpm.io/workspaces) monorepo orchestrated with [Turborepo](https://turborepo.com). It contains the following packages:

| Path              | Package                     | Description                                           |
| ----------------- | --------------------------- | ----------------------------------------------------- |
| `.`               | `@nanoforge-dev/cli`        | The `nf` command line interface                       |
| `libs/config`     | `@nanoforge-dev/config`     | Config types and helpers for `nanoforge.config.ts`    |
| `libs/registry`   | `@nanoforge-dev/registry`   | Registry client and installer, shared with the editor |
| `libs/schematics` | `@nanoforge-dev/schematics` | Schematics used by the CLI to generate projects files |

The CLI depends on the libraries through `workspace:*`, so the libraries must be built before the CLI. The `repo:*` scripts take care of this for you.

## Setup

To get ready to work on the codebase, please do the following:

1. Fork & clone the repository, and make sure you're on the **main** branch
2. Use the Node.js version defined in [`.nvmrc`](../.nvmrc)
3. Run `pnpm install --frozen-lockfile` ([install](https://pnpm.io/installation))
4. Run `pnpm repo:build` to build every package
5. Make your changes
6. Run `pnpm repo:format && pnpm repo:build && pnpm repo:test` to run ESLint/Prettier, build and tests on every package
7. [Submit a pull request](https://github.com/NanoForge-dev/CLI/compare) (Make sure you follow the [conventional commit format](https://github.com/NanoForge-dev/CLI/blob/main/.github/COMMIT_CONVENTION.md))

## Useful commands

Scripts prefixed with `repo:` run on every package of the workspace through Turborepo:

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `pnpm repo:build`     | Build all packages                            |
| `pnpm repo:lint`      | Check formatting and lint all packages        |
| `pnpm repo:format`    | Format and fix lint errors in all packages    |
| `pnpm repo:test`      | Run unit and end-to-end tests of all packages |
| `pnpm repo:test:unit` | Run unit tests of all packages                |
| `pnpm repo:test:e2e`  | Run end-to-end tests of all packages          |

Scripts without prefix (`build`, `lint`, `test`, ...) only run on the CLI package. To run a script on a single library, use the pnpm `--filter` flag:

```sh
pnpm --filter @nanoforge-dev/config test:unit
pnpm --filter @nanoforge-dev/schematics build
```

## Commits

Commits and pull request titles must follow the [conventional commit format](https://github.com/NanoForge-dev/CLI/blob/main/.github/COMMIT_CONVENTION.md). Use the package as scope when your change targets a single one: `cli`, `config`, `registry` or `schematics` (e.g. `feat(config): add server port validation`).

Git hooks are installed automatically by `pnpm install`:

- `commit-msg` checks the commit message with commitlint
- `pre-commit` formats staged files with lint-staged
- `pre-push` runs `repo:build`, `repo:lint` and `repo:test`

## Releases

All the packages of this repository share the same version and are released together. Releases use the shared workflows of [NanoForge-dev/actions](https://github.com/NanoForge-dev/actions) (`@v3`), configured in `.github/nanoforge.json`:

1. Run the **Release PR** workflow (Actions tab). Leave the inputs empty to take the version from the commits, or set `version`. Use `dry-run` to preview. It opens a `releases/cli@<version>` pull request that bumps every package and updates their changelogs
2. Review and merge that pull request with "Squash and merge"
3. Merging it triggers the **Release** workflow: it publishes the packages to npm, creates the `<version>` tag and GitHub release, then syncs `docs/docs` to the `cli` category of the docs

Other merged pull requests release nothing. For an alpha of one package, run **Alpha Release** on your branch and pick the package.
