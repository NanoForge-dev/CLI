# Changelog

All notable changes to this project will be documented in this file.

# [2.3.0](https://github.com/NanoForge-dev/CLI/compare/1.6.2...2.3.0) - (2026-09-24)

> NanoForge v2 changes **how a game is structured**. In v1 a game was one folder split into
> `client/` and `server/`, and the CLI rebuilt its entry files from JSON "save" files. In v2 a
> game is a set of standalone **projects** (client, server, and shared libs). Each project has
> its own typed `nanoforge.config.ts`, and a **workspace** can group them in one monorepo. Entry
> files are normal source code that you own. Nothing regenerates them.
>
> The CLI repository is now a monorepo, and this release is shared by three packages. Each
> library has its own changelog with the details:
>
> - **[`@nanoforge-dev/config` changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/config/CHANGELOG.md)**:
>   the new `nanoforge.config.ts` format, its four types, defaults, validation, and the
>   field-by-field migration from `nanoforge.config.json`.
> - **[`@nanoforge-dev/schematics` changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/schematics/CHANGELOG.md)**:
>   the generated game in v1 vs v2, the new `workspace` / `project` schematics, the engine v2
>   entry file, the demo game and dependency versions.
>
> This section covers what changed in the `nf` CLI itself.

## Why 2.3.0 (and not 2.0.0)

The CLI, `@nanoforge-dev/config` and `@nanoforge-dev/schematics` now share **one version
number** and are released together. That shared version must be higher than the latest
published version of every package. Schematics was already at **2.2.1** (last release from its
old repository), so all three packages are **aligned to the schematics version** and released
as **2.3.0**. The CLI goes from 1.6.2 straight to 2.3.0. There are no CLI 2.0.0, 2.1.x or 2.2.x
releases.

## Game architecture in short

| Concern          | v1                                            | v2                                                                      |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Unit of the game | One app with a `client` and a `server` part   | Independent `client` / `server` projects (plus libs), grouped by a workspace |
| Config           | One `nanoforge.config.json`                   | One `nanoforge.config.ts` / `.js` per project, lib and workspace        |
| Entry file       | Regenerated from `.nanoforge/*.save.json`     | `src/main.ts`, scaffolded once, then yours                              |
| Output / assets  | `.nanoforge/<part>`, `<part>/static`          | `dist/`, `assets/` inside each project                                  |
| Several apps     | Not possible                                  | Every project matched by the workspace's `packages` is built and started |

`nf new` creates either a single `client` project (single-player) or a workspace with
`apps/client` and `apps/server` (multiplayer). The schematics changelog has the full generated
trees.

## How the CLI reads configs

The CLI no longer ships its own JSON config loader (`class-validator` defaults, `-c` file name).
It uses `@nanoforge-dev/config` to load the config in the command's directory
(`nanoforge.config.ts`, or `.js` if there's no `.ts`). If neither file exists, the command
fails with `ConfigNotFoundError`.

On top of that, the CLI resolves the workspace (`parseWorkspaceConfig`, `resolveProjects`):

- **Root is `client` / `server`:** that project is the only target.
- **Root is `workspace`:** each `packages` glob is expanded from the root:
  - a matched directory without a config is skipped
  - a glob that matches nothing logs a warning
  - a nested `workspace` throws
- **Root is `lib`:** error. A lib can't be an entry point.

The result is a list of `{ directory, config }` for every client and server project. Libs are
left out. `build` and `start` loop over this list, and `create` uses it to find its target.

## Code is no longer generated from save files

In v1, `main.ts` was build output: the CLI regenerated it from `.nanoforge/<part>.save.json`
with `nf generate` or `nf dev --generate`. In v2 you write `main.ts` yourself, so the CLI
drops everything that supported regeneration (#217):

- the `generate` command, its action, messages, docs page and e2e suite
- the `--generate` option of `nf dev`
- the `initFunctions` input of `nf new`

`build --editor` now builds the project's `editor.entryFile`. It defaults to the same
`src/main.ts`, and nothing editor-specific is added to it any more. In v1, a separate
generated entry added `Graphics2DEditorLibrary`.

## Command changes

### `nf new` (#218)

- The "server?" question now means **multiplayer**, and it decides the architecture:
  - **No:** a single `client` project is generated directly in the target directory.
  - **Yes:** a `workspace` is generated, plus `apps/client` (`hasServer: true`) and
    `apps/server`. Package names become `<name>-client` / `<name>-server`.
- It calls the new `workspace` and `project` schematics instead of the old chain
  (`application` → `configuration` → `part-base` → `part-main` → `docker`).
- It forwards `strict`, `packageManager`, `docker` and `editor` to each project.

### `nf build` (#219)

- It builds **every client/server project** found in the workspace, instead of looking at
  `client.enable` / `server.enable`.
- Each target builds, copies assets, resets its output and watches files **inside its own
  project directory**.
- If there is more than one project, logs show the project path, e.g. `Client (apps/client)`.
- `--client-entry`, `--client-static-dir`, `--client-out-dir` and their `--server-*`
  equivalents still work. They now override `entryFile`, `dir.assets` and `out.dir` of each
  project of that type.
- If no assets directory is set, the asset copy step is skipped.

### `nf start` (#220, #224)

- It starts **every server project, then every client project**. If it finds no project, it
  fails with a hint to check `packages` or run `nf new`.
- Each client uses its own `port` and its own `tls` config. `--port`, `--cert` and `--key`
  still override them.
- `--watch-server-dir` is passed to the client loader only when there is **exactly one**
  server project.
- `--client-dir` / `--server-dir` now mean **output** directories. They override `out.dir`.
- Wording changed from SSL to **TLS** in flags, errors and docs. Errors now point to
  `tls.cert` / `tls.key` in `nanoforge.config.ts`.
- The package manager is detected **once**, from the directory the command runs in (the
  workspace root), not once per loader (#224).

### `nf create` (#222)

- It reads the project config to find where to put the file (`dir.components` / `dir.systems`)
  and which language to use.
- **Client or server is now inferred** from the project's `type`, so `-s, --server` is removed.
- Running it at a **workspace root** is refused. Run it inside a project, or pass
  `-d apps/client`.

### `nf dev` (#217)

- `--generate` is removed. `dev` now just runs `build --watch` (plus `--editor` when asked) and
  `start --watch` side by side.

### `nf generate` (#217)

- **Removed.**

## Breaking changes

- `nanoforge.config.json` is **no longer read**. Use one `nanoforge.config.ts` / `.js` per
  project. The key mapping is in the
  [config changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/config/CHANGELOG.md).
- `nf generate` and `nf dev --generate` are removed.
- `nf create -s/--server` is removed. The side now comes from the project config.
- `-c, --config` is removed from `build`, `start` and `create`.
- `--client-dir` / `--server-dir` on `nf start` now point to **output** directories.
- `nf new` generates the v2 layout and engine v2 code. See the
  [schematics changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/schematics/CHANGELOG.md).
- The CLI now declares `engines.node: "26"`, so **users need Node 26**.

## Migrating a v1 game

1. **Choose the shape.**
   - Client only: keep a single project at the root.
   - Client + server: create a workspace root with `packages: ["apps/*"]`, then move
     `client/` to `apps/client/src/` and `server/` to `apps/server/src/`.
2. **Replace `nanoforge.config.json`** with one `nanoforge.config.ts` per project. The
   field-by-field table is in the
   [config changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/config/CHANGELOG.md).
3. **Make `main.ts` yours.** Copy the last generated `client/main.ts` / `server/main.ts` to
   `src/main.ts`. Then remove `.nanoforge/*.save.json` and `.nanoforge/editor/`.
4. **Inline init hooks.** Move the contents of `init/before-*.ts` / `after-*.ts` into `main.ts`
   around `app.init()` / `app.run()`.
5. **Update engine imports.** For example `@nanoforge-dev/ecs-client` →
   `@nanoforge-dev/ecs/client`, and `Context` from `@nanoforge-dev/common` → `nanoforge`. The
   [schematics changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/schematics/CHANGELOG.md)
   shows a full v2 entry file.
6. **Split dependencies** into a `package.json` per project, and set up your package manager's
   workspace (`pnpm-workspace.yaml` or `"workspaces"`).
7. **Move static files** into `assets/`, or set `dir.assets`.
8. **Update scripts.** Drop `nf generate` and `--generate`. Instead of `nf create --server`,
   run `nf create` inside the server project.

## Known issues

CLI issues:

- **Leftover `-c, --config` on `nf dev`.** Its default is still `nanoforge.config.json`, and the
  value is never passed on to `build` / `start`. The configuration docs, `dev.mdx` and the README
  still mention `-c`.
- **`build` / `start` ignore libs.** `libs` and `lib` configs are discovered but not built or
  linked yet.

Issues in the generated code, which users will hit through `nf new` / `nf create` (details in
the [schematics changelog](https://github.com/NanoForge-dev/CLI/blob/main/libs/schematics/CHANGELOG.md)):

- The generated workspace scripts run `nf dev -r`, `nf build -r` and `nf start -r`, but no
  command defines `-r`.
- `nf create` templates still use v1 imports, so created components and systems don't compile
  in a v2 project.
- Generated configs import `nanoforge/config`, and the engine v2 packages aren't published yet.

## Repository, tooling & CI

- **Monorepo** (#197): a pnpm workspace (`.`, `libs/*`) run by **Turborepo** (`turbo.json`
  with `build`, `build:dev`, `lint`, `format`, `test:unit` and `test:e2e`, remote cache on).
  New root scripts `repo:build`, `repo:lint`, `repo:format`, `repo:test`, `repo:test:unit` and
  `repo:test:e2e`. The Husky pre-push hook runs the `repo:*` versions.
- **Packages:** `@nanoforge-dev/cli` (root), `@nanoforge-dev/config` (`libs/config`) and
  `@nanoforge-dev/schematics` (`libs/schematics`, previously its own repository). The CLI uses
  both libraries through `workspace:*`. All three share one version and release together.
- **Releases** (#225): release branches are now named `releases/cli@<version>`. The Release
  workflow publishes config → schematics → cli. The automatic beta release on every merged PR
  is gone. Alpha releases of a single package are still triggered by hand. CONTRIBUTING explains
  the flow.
- **Commit scopes** `cli`, `config` and `schematics` are documented, and the labels and
  issue/labeler configs were updated for the new packages.
- **Runtime:** Node **25 → 26** (`.nvmrc`, `engines`), pnpm **11.10 → 12.0**.
- **Build:** tsdown no longer uses `skipNodeModulesBundle`, because its package-name check also
  matched the `@lib/*` / `@utils/*` path aliases and left them unresolved in the output.
- **Dependencies:** `@nanoforge-dev/editor` moved from `optionalDependencies` to
  `dependencies`. Loaders went to `^1.5.1` (#227). Vitest 5, tsdown 0.23, Angular DevKit 22.1,
  dotenv 18 and others were bumped (#230). The pnpm catalog `tests` was renamed to `test`.
- **Docs:** new *Schematics* section. The configuration page was rewritten for the typed
  multi-config model. The `generate` page was removed and the command pages renumbered.
- **Tests:** the e2e suites for `new`, `build`, `create`, `install` and `new-config` were
  rewritten for the new layout, and `cli-generate` was removed. New unit tests cover the
  workspace config parser and the config loader.
- **Contributors** list updated (#229).

## Commits

### Bug Fixes

- **start:** Change path for detecting package manager (#224) ([ddbed0a](https://github.com/NanoForge-dev/CLI/commit/ddbed0a6bd39383f48b2e4fc71ba015e4df856ae)) by @Exeloo
- Remove generate command as it's no longer usefull (#217) ([a07acd7](https://github.com/NanoForge-dev/CLI/commit/a07acd7ee01afd9dd17eb15051c15e24dbb19c84)) by @Exeloo
  - **BREAKING CHANGE:** The `generate` command no longer exist

### Documentation

- Update links (#212) ([be9f483](https://github.com/NanoForge-dev/CLI/commit/be9f483c76ba841cb9edccfc477fb2b1904c1f5f)) by @Exeloo

### Features

- Put network lib in dependencies (#226) ([e2dde26](https://github.com/NanoForge-dev/CLI/commit/e2dde2607736949caf85a057135c23fed8408861)) by @Exeloo
- Add new project and workspace schematics and remove old ones (#216) ([f551392](https://github.com/NanoForge-dev/CLI/commit/f551392a843d592b1efc70cf4613f98f616999b0)) by @Exeloo
- Add config parser (#214) ([cde54ab](https://github.com/NanoForge-dev/CLI/commit/cde54abba3a8b8385e6441bff8a39365dffde90c)) by @Exeloo
- Add schematics (#200) ([330b9be](https://github.com/NanoForge-dev/CLI/commit/330b9bee1084c911aad8291c25aa591f0eb0d340)) by @Exeloo
- Add config lib and monorepo config files (#197) ([197a75c](https://github.com/NanoForge-dev/CLI/commit/197a75c82699f8a90c14be03208bd6313f53886d)) by @Exeloo

### Refactor

- **cli:** Change create command to fit the new architecture (#222) ([3afb463](https://github.com/NanoForge-dev/CLI/commit/3afb463c96d7e511e492a6c8cbe82b686d837a08)) by @Exeloo
- **cli:** Change start command to fit the new architecture (#220) ([3acb4a1](https://github.com/NanoForge-dev/CLI/commit/3acb4a1e214426a1f5e953774859eba38ca49ffa)) by @Exeloo
- Change build cmd to new archi (#219) ([6700f71](https://github.com/NanoForge-dev/CLI/commit/6700f71e9d500efea0eb80aaad655623415f489b)) by @Exeloo
- **cli:** Change new cmd to new archi (#218) ([a2e0d1f](https://github.com/NanoForge-dev/CLI/commit/a2e0d1ffe60063d3f5ae22ed78718e7592fe0f72)) by @Exeloo

# [1.6.2](https://github.com/NanoForge-dev/cli/compare/1.6.1...1.6.2) - (2026-07-07)

## Bug Fixes

- Set init functions default config to false (#190) ([1981e20](https://github.com/NanoForge-dev/cli/commit/1981e20235b8e67dfe520c3525aca15cbcdfbd23)) by @Exeloo

# [1.6.1](https://github.com/NanoForge-dev/cli/compare/1.6.0...1.6.1) - (2026-07-04)

## Bug Fixes

- Editor command (#188) ([3cd1d8f](https://github.com/NanoForge-dev/cli/commit/3cd1d8fc62909d5e64fb9ab5969b9cfd4d86aa12)) by @Exeloo
- **schematics:** Since pnpm v11 we need to resolve the path to schematics ourselves (#185) ([6ba1d3f](https://github.com/NanoForge-dev/cli/commit/6ba1d3f09dac4982b0639cad6d55c860d2da6b55)) by @MartinFillon

## Documentation

- Add registry link to login command (#187) ([cbec8dc](https://github.com/NanoForge-dev/cli/commit/cbec8dc21bee49b4ac7874a4f8d22cccb3f4f5b8)) by @Exeloo
- **ssl:** Add missing config for ssl docs (#184) ([7a4431c](https://github.com/NanoForge-dev/cli/commit/7a4431c3a4f6d5687af5312df0ffd2f78bf5aef3)) by @MartinFillon

## Features

- Display npm package link (#182) ([eb0a85c](https://github.com/NanoForge-dev/cli/commit/eb0a85c792152006c205a3de09bb14cfb23f3d91)) by @josephinecr
- **editor:** Display clickable link when starting editor (#180) ([22c536d](https://github.com/NanoForge-dev/cli/commit/22c536d07e4a6d8a9bad15839989d7bccdc02db3)) by @josephinecr
- Add ssl config to json configuration (#179) ([10787fd](https://github.com/NanoForge-dev/cli/commit/10787fd37aabfbfe3ecadd234d445e02526e9493)) by @josephinecr

# [1.6.0](https://github.com/NanoForge-dev/cli/compare/1.5.3...1.6.0) - (2026-06-23)

## Bug Fixes

- Upgrade actions and add repository name to publish docs (#163) ([acc5439](https://github.com/NanoForge-dev/cli/commit/acc5439c8edd2afd016cdcb4aec8be7fd9f4301b)) by @Exeloo

## Documentation

- Add full cli docs and guides (#174) ([f618d37](https://github.com/NanoForge-dev/cli/commit/f618d374413a7087a97b422cf301d88efe32a761)) by @Exeloo

## Features

- Add read global config on cwd (#173) ([67c0eac](https://github.com/NanoForge-dev/cli/commit/67c0eaca7ac81a44eba45268da01c18120192ff0)) by @Exeloo
- Add editor flag on dev cmd (#171) ([2af80f5](https://github.com/NanoForge-dev/cli/commit/2af80f503419c6c2155282aea3c58b2a7b934205)) by @josephinecr
- Add suggestion for error messages (#170) ([c7cb939](https://github.com/NanoForge-dev/cli/commit/c7cb93941d411683da2f00fea74efbdc3f76253a)) by @josephinecr
- Change error handling to be more specific (#168) ([5329236](https://github.com/NanoForge-dev/cli/commit/532923687b0208a1c26dac16e9d7671591e11666)) by @josephinecr

### New Contributors

- @josephinecr made their first contribution in #171

# [1.5.3](https://github.com/NanoForge-dev/cli/compare/1.5.2...1.5.3) - (2026-06-04)

## Bug Fixes

- Rollback to ci path changes (#161) ([8113568](https://github.com/NanoForge-dev/cli/commit/81135687d625712fc8ee2e656bdc7da157048f40)) by @Exeloo

# [@nanoforge-dev/cli@1.5.2](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.4.2...@nanoforge-dev/cli@1.5.2) - (2026-06-04)

## Bug Fixes

- Change local bun path finding (#144) ([76be5df](https://github.com/NanoForge-dev/cli/commit/76be5df8810c3589b16c75b18d95262c887aee68)) by @Exeloo
- **docs:** Sumary link bad format (#140) ([dbea2cf](https://github.com/NanoForge-dev/cli/commit/dbea2cf411cfc8c1b60d0abd62d51d1631e3a2ee)) by @Tchips46
- Add git remote and docker params handling (#130) ([99fbe2b](https://github.com/NanoForge-dev/cli/commit/99fbe2b1a5af9541650732314127413829b4192e)) by @Exeloo

## Documentation

- Refactor docs to mdx (#134) ([d301d90](https://github.com/NanoForge-dev/cli/commit/d301d9069fdb8d582ecc14ad2e0f5d91b4deb40f)) by @MartinFillon

## Features

- Handle lib deps (#131) ([9093c02](https://github.com/NanoForge-dev/cli/commit/9093c0207b4448eee8395885c9b7740ae8700307)) by @Exeloo

# [@nanoforge-dev/cli@1.4.2](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.4.1...@nanoforge-dev/cli@1.4.2) - (2026-04-19)

## Bug Fixes

- Env nanoforge url (#127) ([bf23728](https://github.com/NanoForge-dev/cli/commit/bf237286ea9cfc259b782084091b6c1d1f3535a9)) by @Exeloo

# [@nanoforge-dev/cli@1.4.1](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.4.0...@nanoforge-dev/cli@1.4.1) - (2026-04-19)

## Features

- Add git init on new command (#122) ([921a182](https://github.com/NanoForge-dev/cli/commit/921a182148ddfbf8470be1518cd8cbcb6092c7fb)) by @Exeloo
- Add editor command (#118) ([918da39](https://github.com/NanoForge-dev/cli/commit/918da39ce41e421a5a3ae6c4d8264dbeed012209)) by @Exeloo

# [@nanoforge-dev/cli@1.4.0](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.3.0...@nanoforge-dev/cli@1.4.0) - (2026-04-10)

## Features

- Add static folder to build (#114) ([e6e4e36](https://github.com/NanoForge-dev/cli/commit/e6e4e36f06cc146de76df7f4806d7f33a815382b)) by @Exeloo
- Add create command (#111) ([3470dc6](https://github.com/NanoForge-dev/cli/commit/3470dc6e235e26b1b3fa0d5fabd6b855c18aed88)) by @Exeloo
- Add editor flag on code generation (#106) ([bd3ce28](https://github.com/NanoForge-dev/cli/commit/bd3ce28bcaa72c72de34783b19951a181d39cf46)) by @Exeloo
- **stop:** Catch signals end repeat it to childs (#105) ([812333d](https://github.com/NanoForge-dev/cli/commit/812333d2dff2ad365e780d75f07ee7eb72942174)) by @Tchips46

### New Contributors

- @Tchips46 made their first contribution in #105

# [@nanoforge-dev/cli@1.3.0](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.2.0...@nanoforge-dev/cli@1.3.0) - (2026-03-15)

## Bug Fixes

- Npm exec issues and add lint param to new command (#101) ([a1ed759](https://github.com/NanoForge-dev/cli/commit/a1ed75977348cac78f1adb825acea465d9ebe69a)) by @Exeloo

## Features

- Add components and systems installation (#98) ([5fca64a](https://github.com/NanoForge-dev/cli/commit/5fca64a86219beec9b4b5b72c576d973dc012937)) by @Exeloo
- Add publish and unpublish commands (#97) ([e49d00d](https://github.com/NanoForge-dev/cli/commit/e49d00d50584e0170d3e0793dd6d6e265939b519)) by @Exeloo
- Add env handling in start command (#96) ([c61f8f0](https://github.com/NanoForge-dev/cli/commit/c61f8f0151b8bfd8be74d44f426d9b9e2978ac4b)) by @Exeloo
- Add login and logout commands with apiKey handling (#88) ([5be790a](https://github.com/NanoForge-dev/cli/commit/5be790a0441cf1cebe60c6cd919a964a82a4e0a6)) by @Exeloo

# [@nanoforge-dev/cli@1.2.0](https://github.com/NanoForge-dev/cli/compare/@nanoforge-dev/cli@1.1.1...@nanoforge-dev/cli@1.2.0) - (2026-03-04)

## Bug Fixes

- Add name to cwd to install packages in new (#69) ([1e17868](https://github.com/NanoForge-dev/cli/commit/1e17868398e6ec0f639e83f23db6d0af8a8673af)) by @Exeloo

## Features

- **docker:** Setup new docker option to generete docker file (#82) ([99244b1](https://github.com/NanoForge-dev/cli/commit/99244b1ffc225ffb55d85f85a9a1eeddb87de628)) by @MartinFillon

## Refactor

- Beautify all code base and add tests (#77) ([67c297c](https://github.com/NanoForge-dev/cli/commit/67c297c191c1251a2776d2c3caf0cbd8ff36f906)) by @Exeloo

### New Contributors

- @dependabot[bot] made their first contribution in #71

# [1.1.1](https://github.com/NanoForge-dev/cli/compare/1.0.0...1.1.1) - (2026-02-18)

## Bug Fixes

- Change exec command (#66) ([5fe368c](https://github.com/NanoForge-dev/cli/commit/5fe368cc92ac1a12cdbe3f05248f8f3ae4dc38b1)) by @Exeloo
- Resolve boolean issue on schematics (#65) ([2acb95d](https://github.com/NanoForge-dev/cli/commit/2acb95d8c2388ec121d68a039f96a8d04108cb23)) by @Exeloo
- Add binary resolution for bun (#63) ([b874e5e](https://github.com/NanoForge-dev/cli/commit/b874e5e2d6107a3fa8f939749dc486dded1f3adf)) by @Exeloo

## Documentation

- Fix documentation (#45) ([11490ca](https://github.com/NanoForge-dev/cli/commit/11490caa23fc3cf7f0f09e0dd3be1d6db559338e)) by @Exeloo

## Features

- **https:** Setup certificate passing (#75) ([fc00b02](https://github.com/NanoForge-dev/cli/commit/fc00b02b2ae96523bf01e675e50b751b576b3e58)) by @MartinFillon
- Add docker release and local bun (#49) ([f3e2ad6](https://github.com/NanoForge-dev/cli/commit/f3e2ad6096d2c12ca17e191290d460fc74cc5839)) by @Exeloo
- Add watch and `dev` command (#46) ([7b8413c](https://github.com/NanoForge-dev/cli/commit/7b8413c8125bd1763bd94dd8710fa6130e560cbc)) by @Exeloo

## Testing

- Add unit and e2e tests (#67) ([2ef8f9d](https://github.com/NanoForge-dev/cli/commit/2ef8f9d47db96d8a468564dd0b36e3d30121f646)) by @Exeloo

### New Contributors

- @github-actions[bot] made their first contribution in #59

# [1.1.0](https://github.com/NanoForge-dev/cli/compare/1.0.0...1.1.0) - (2026-02-09)

## Documentation

- Fix documentation (#45) ([11490ca](https://github.com/NanoForge-dev/cli/commit/11490caa23fc3cf7f0f09e0dd3be1d6db559338e)) by @Exeloo

## Features

- Add docker release and local bun (#49) ([f3e2ad6](https://github.com/NanoForge-dev/cli/commit/f3e2ad6096d2c12ca17e191290d460fc74cc5839)) by @Exeloo
- Add watch and `dev` command (#46) ([7b8413c](https://github.com/NanoForge-dev/cli/commit/7b8413c8125bd1763bd94dd8710fa6130e560cbc)) by @Exeloo

# [1.0.0](https://github.com/NanoForge-dev/cli/tree/1.0.0) - (2026-01-06)

## Bug Fixes

- Change bun binary (#34) ([c529b33](https://github.com/NanoForge-dev/cli/commit/c529b332f0039ccb29c3f1a350498f057dc7f106)) by @Exeloo

## Documentation

- Write-usage-and-complete-schemas (#36) ([2f4dd3a](https://github.com/NanoForge-dev/cli/commit/2f4dd3ac21e623565dc48f0c2a70279db9916312)) by @MartinFillon
- Add contributing docs and actions (#33) ([55341d1](https://github.com/NanoForge-dev/cli/commit/55341d1329076d80db1429c607c1f3cf52d2b4d8)) by @Exeloo
- Setup action to push all docs to docs repo (#29) ([99e26c6](https://github.com/NanoForge-dev/cli/commit/99e26c6feed162502ddee28d5de2f1451ee55c74)) by @MartinFillon

## Features

- Split ecs and add miscellaneous (#28) ([35175e0](https://github.com/NanoForge-dev/cli/commit/35175e05bb511fa0634dac52f9b8b45acaeccb34)) by @Exeloo
- Add options on `new` command (#27) ([09988c2](https://github.com/NanoForge-dev/cli/commit/09988c2890818fc360c16a2632b8f00a9f14c816)) by @Exeloo
- Add `generate` command (#26) ([dc35464](https://github.com/NanoForge-dev/cli/commit/dc3546472474dcaa016d03750486be5cc17a6d96)) by @Exeloo
- Enhance `new` command with client and server contents (#22) ([aec2d20](https://github.com/NanoForge-dev/cli/commit/aec2d203e9131317239380e72eff45a6eb83c0e4)) by @Exeloo
- Add `new` command (#15) ([f9e3145](https://github.com/NanoForge-dev/cli/commit/f9e3145c8aa965571a4de87b27f4a7c700d3a86f)) by @Exeloo
- Add `run` command (#14) ([734615e](https://github.com/NanoForge-dev/cli/commit/734615efad12199a8e87e9b96c46945ba54f1e28)) by @Exeloo
- Add build command (#10) ([62ba12a](https://github.com/NanoForge-dev/cli/commit/62ba12ad5249d8fbade7430ee3fbe5b500586e26)) by @Exeloo
- Add install command ([d1cf961](https://github.com/NanoForge-dev/cli/commit/d1cf961d2e0ed9cfeb735df4d00de33a41ae8048)) by @Exeloo
- Add base cli ([5408c9f](https://github.com/NanoForge-dev/cli/commit/5408c9f26c27885c8bfd61c56da5655477a433a4)) by @Exeloo
- Init repo ([d5ef49d](https://github.com/NanoForge-dev/cli/commit/d5ef49d20cf812fe9e19e18e1a31cb95fc522b14)) by @Exeloo

### New Contributors

- @MartinFillon made their first contribution in #36
- @Exeloo made their first contribution in #34
- @renovate[bot] made their first contribution in #19
