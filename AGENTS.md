# CLI

## Role

This repo contains the CLI (`nf`) of NanoForge, a game engine for the browser. The CLI is the command-line tool used by developers to create, develop, build, start, publish, and manage NanoForge projects (and their components/systems), as well as to launch the editor and interact with the NanoForge package registry.

## Tech Stack

- **Language**: TypeScript (Node.js 26), package published as ESM (`"type": "module"`)
- **CLI framework**: [Commander](https://github.com/tj/commander.js), with a custom Command/Action separation (see Conventions), interactive prompts via `@inquirer/prompts`
- **Code generation**: Angular DevKit Schematics (`@angular-devkit/schematics`, `@angular-devkit/schematics-cli`) to generate workspaces, projects, components, systems, and editor plugins
- **Project execution runtime**: Bun (the CLI bundles/uses `bun` as a dependency)
- **Build**: [tsdown](https://github.com/sxzz/tsdown) (Rolldown-based bundler) + type checking via `tsc --noEmit`
- **Monorepo**: pnpm workspaces + [Turborepo](https://turbo.build) to orchestrate build/lint/format/test across the root package and the internal libs
- **Package manager**: pnpm (with version catalogs via `pnpm-workspace.yaml`)
- **Reproducible dev environment**: Nix (`flake.nix`: Node 24, pnpm, bun)
- **Internal repo dependencies** (`workspace:*`): `@nanoforge-dev/config` (config management lib, `libs/config` package of this repo), `@nanoforge-dev/registry` (registry client and installer, `libs/registry` package of this repo, also used by the editor) and `@nanoforge-dev/schematics` (schematics lib, `libs/schematics` package of this repo)
- **Notable published external dependencies**: `@nanoforge-dev/editor` (`catalog:core`), `@nanoforge-dev/loader-client` and `@nanoforge-dev/loader-server` (`catalog:loader`)

## Project Structure

```
src/
├── bin/nf.ts                 # executable entry point for the `nf` binary
├── command/                    # Commander command definitions (CLI interface)
│   ├── abstract.command.ts
│   ├── command.loader.ts
│   └── commands/                 # build, create, dev, editor, install, login, logout,
│                                   #   new, publish, start, unpublish
├── action/                    # business logic executed by each command
│   ├── abstract.action.ts
│   ├── common/                   # helpers shared by actions (schematics runner, spinner)
│   └── actions/                  # one action per command (build, create, dev, ...)
└── lib/                      # shared internal libraries
    ├── config/                    # project config loading/resolution
    ├── global-config/              # user global config (e.g. credentials)
    ├── git/                          # git integration (e.g. repo init via --git)
    ├── manifest/                        # nanoforge.manifest.json reading (the registry's schema)
    ├── package-manager/                   # npm/yarn/pnpm/bun detection/abstraction
    ├── question/                            # interactive prompts (index.ts + one file per question in questions/)
    ├── registry/                              # @nanoforge-dev/registry client with the saved key, publish ignore list
    ├── runner/                                  # child process execution (build/dev/start)
    ├── schematics/                                # bridge to Angular DevKit schematics
    ├── tree-kill/                                   # recursive process tree kill
    ├── ui/                                            # terminal display (spinners, colors)
    ├── input/, types/, utils/                           # user input helpers, shared types, generic utilities
    └── constants.ts                                       # shared constants

libs/                        # internal packages published separately (pnpm workspace)
├── config/                    # @nanoforge-dev/config: config definition/validation/merge
│   └── src/{defaults,define-config,merge,parse,types}
├── registry/                  # @nanoforge-dev/registry: registry client, archives, nf_modules installer (shared with the editor)
│   └── src/{archive,client,directory,install,item,manifest,project,registry,serve,wire}
└── schematics/                 # @nanoforge-dev/schematics: schematics (component, project, system, workspace, plugin)
    └── src/{libs,utils,collection.json}

docs/                         # Mintlify documentation (.mdx) + public JSON Schemas
├── docs/{getting-started,configuration,commands,schematics}/   # synced to the `cli` category of the docs repo at release
│   └── navigation.json           # page order and groups (every page listed once)
├── guides/                      # step-by-step guides (creating a project, local dev, build & deployment, publishing a package...)
│   └── navigation.json           # guide order
└── *.schema.json                # JSON schemas for the config file, the manifest, etc.

e2e/                          # end-to-end tests of the compiled binary (spawns the `nf` process)
scripts/nightly.sh            # nightly test runner (writes reports to reports/)
```

## Main Commands

The generated binary is used as follows: `nf [command] [options]` (e.g. `nf new`, `nf build`, `nf dev`, `nf editor`, `nf install`, `nf login`, `nf publish`...). Full command documentation is in `docs/docs/commands/`.

Developing the CLI itself (from the repo root). On a fresh clone, run `pnpm install --frozen-lockfile && pnpm run repo:build` first: `pnpm run build` alone fails with TS2307 `@nanoforge-dev/config` until the libs are built.

```bash
pnpm run build          # tsc --noEmit && tsdown
pnpm run build:dev       # build in development mode
pnpm run start              # node dist/nf.js
pnpm run lint                 # prettier --check + eslint
pnpm run format                 # prettier --write + eslint --fix
pnpm run test                     # unit + e2e
pnpm run test:unit                  # vitest (vitest.config.ts)
pnpm run test:e2e                     # vitest (vitest.config.e2e.ts), runs the built binary
pnpm run changelog                      # git-cliff
pnpm run release                          # @favware/cliff-jumper
```

Releases go through the Release PR workflow (see Conventions): agents never run `pnpm run release` locally.

Monorepo orchestration (root + `libs/*` via Turborepo):

```bash
pnpm run repo:build          # turbo run build (concurrency 5)
pnpm run repo:lint             # turbo run lint
pnpm run repo:format             # turbo run format
pnpm run repo:test                 # turbo run test:unit then test:e2e
```

## Conventions

- **Command/Action architecture**: each command (`command/commands/*.command.ts`) only declares the Commander interface (arguments/options) and delegates execution to a corresponding Action class (`action/actions/*.action.ts`) extending `abstract.action.ts` — strict separation between the CLI interface and the business logic.
- **Code style**: shared config via the published external packages `@nanoforge-dev/utils-eslint-config` and `@nanoforge-dev/utils-prettier-config` (`catalog:lint`), with `@trivago/prettier-plugin-sort-imports` for import ordering (`@lib/*`, `@utils/*`, `~/*`, then relative imports).
- **Docs pages**: page file names have no number prefix; a new page must be added to the folder's `navigation.json`, or it won't show up.
- **Commits**: Conventional Commits, checked by Commitlint and Husky hooks (`lint-staged` on staged files).
- **Releases**: all packages share one version and are released together through the shared `NanoForge-dev/actions` v3 workflows, configured in `.github/nanoforge.json` (changelogs by `git-cliff`): `release-pr.yml` (manual, opens the `releases/cli@<version>` PR), `release.yml` (on merge of that PR: npm publish, tag, GitHub release, docs sync) and `alpha-release.yml` (manual, an alpha of one package). See `.github/CONTRIBUTING.md`.
- **Generated project environment variables**: prefix convention exposed to games built by the CLI — `NANOFORGE_CLIENT_*` (client only), `NANOFORGE_SERVER_*` (server only), `NANOFORGE_*` (both); the prefixes are stripped before being exposed to consuming libs.
- **Config schema**: a generated project's config file is validated against published JSON Schemas (`docs/*.schema.json`). The `$id` of `config.schema.json` is `https://docs.nanoforge.eu/docs/cli/config.schema.json` (`manifest.schema.json` is also on `docs.nanoforge.eu`; the build, client, run and server config schemas still use `https://nanoforge-dev.github.io/docs/cli/<name>.schema.json`).
