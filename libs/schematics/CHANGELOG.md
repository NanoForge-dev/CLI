# Changelog

All notable changes to this project will be documented in this file.

# [2.3.0](https://github.com/NanoForge-dev/CLI/compare/1.6.2...2.3.0) - (2026-09-24)

> `@nanoforge-dev/schematics` now lives in the CLI monorepo (`libs/schematics`) and is released
> together with `@nanoforge-dev/cli` and `@nanoforge-dev/config`. In this release the
> collection was rewritten for the NanoForge v2 game architecture. The generated game changed
> shape, and entry files are no longer regenerated from save files.

## Why 2.3.0

`@nanoforge-dev/cli`, `@nanoforge-dev/config` and `@nanoforge-dev/schematics` now share **one
version number** and are released together. The shared version must be higher than the latest
published version of every package. Schematics had the highest number of the three: **2.2.1**,
its last release from the old `NanoForge-dev/schematics` repository. So every package is
aligned on the schematics line, and this release is the next minor version, **2.3.0**.

For schematics, this is the normal next release after 2.2.1. The other packages jump to catch
up: CLI 1.6.2 → 2.3.0, config 1.4.2 → 2.3.0. From now on, the three packages always have the
same version.

## The generated game: v1 vs v2

### v1: one app, two parts, entry files built from save files

```
my-game/
├── nanoforge.config.json        # one config for client + server
├── .nanoforge/
│   ├── client.save.json         # libraries / components / systems / entities
│   ├── server.save.json
│   └── editor/<part>/main.ts    # generated editor entry
├── client/
│   ├── main.ts                  # GENERATED from client.save.json (part-main)
│   ├── init/                    # before-/after- init, registry-init and run hooks
│   ├── components/example.component.ts
│   └── systems/example.system.ts
└── server/                      # same layout, only with a server
```

It took five schematics to build this: `application` → `configuration` → `part-base` →
`part-main` → `docker`. `part-main` read `.nanoforge/<part>.save.json` and wrote `main.ts`
again every time `nf generate` ran.

### v2: standalone projects, grouped by a workspace

A single-player game is **one `client` project**:

```
my-game/
├── nanoforge.config.ts          # { type: "client" }
├── package.json                 # nf dev / nf build / nf start
├── tsconfig.json | jsconfig.json
├── assets/
└── src/
    ├── main.ts                  # scaffolded once, then yours
    ├── components/  position-2d, drawable-circle-2d
    └── systems/     draw-2d
```

A multiplayer game is a **workspace** plus one project per app:

```
my-game/
├── nanoforge.config.ts          # { type: "workspace", packages: ["apps/*"] }
├── package.json                 # workspace root
├── pnpm-workspace.yaml          # pnpm only
├── .env                         # client ↔ server networking
├── Dockerfile / .dockerignore   # optional: one image for every app
└── apps/
    ├── client/                  # { type: "client" }: draw-2d + position-sync
    └── server/                  # { type: "server" }: move-2d
```

| Concern            | v1                                              | v2                                                              |
| ------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| Unit of generation | One app with `client/` and `server/` parts      | A `workspace` and independent `project`s (`part: client/server`) |
| Config             | One `nanoforge.config.json`                     | One `nanoforge.config.ts/.js` per workspace and per project      |
| Entry file         | Regenerated from `.nanoforge/*.save.json`       | Scaffolded once, then owned by the developer                    |
| Lifecycle hooks    | `init/*.ts` files (`initFunctions`)             | Removed. Write the code in `main.ts` around `init()` / `run()`  |
| Dependencies       | One `package.json`                              | One per project, each with only the libraries it needs          |
| Docker             | `docker` schematic                              | `docker` option on `workspace` or on a standalone `project`     |

## Collection

| Schematic   | Status      | Purpose                                                                                     |
| ----------- | ----------- | ------------------------------------------------------------------------------------------- |
| `workspace` | **New**     | Monorepo root: config, `package.json`, TS/JS config, `.env`, `.gitignore`, README, Docker   |
| `project`   | **New**     | A `client` or `server` project: config, `package.json`, `src/main`, demo game, Docker       |
| `component` | Kept        | A single ECS component with its editor manifest                                             |
| `system`    | Kept        | A single ECS system with its editor manifest                                                |
| `application`, `configuration`, `part-base`, `part-main`, `docker` | **Removed** | Replaced by `workspace` + `project` |

With `part-main` gone, the save-file format, the save → `main.ts` code generator, the editor
entry variant (`Graphics2DEditorLibrary`) and the `init/` hook templates are all removed too.

## `workspace` schematic

- Options: `name`, `directory` (defaults to `name`), `language`, `strict`, `packageManager`,
  `allowBuilds`, `docker`.
- Writes a root `nanoforge.config` with `{ type: "workspace", packages: ["apps/*"] }`, and
  workspace wiring for the chosen package manager: `pnpm-workspace.yaml` for pnpm,
  `"workspaces": ["apps/*"]` for the others.
- Root `devDependencies`: `@nanoforge-dev/cli`, `nanoforge`, `typescript` (limited to major 6).
- `bun` is always allowed to run its install script, because `@nanoforge-dev/cli` depends on
  it. The allow-list goes into `allowBuilds` (pnpm), `allowScripts` (npm) or
  `trustedDependencies` (bun).
- `.env` sets the default networking values:
  `NANOFORGE_CLIENT_SERVER_{TCP,UDP}_PORT=4444/4445`, `NANOFORGE_CLIENT_SERVER_ADDRESS=127.0.0.1`
  and `NANOFORGE_SERVER_LISTENING_{TCP,UDP}_PORT=4444/4445`.
- With `docker`, it writes one multi-stage `Dockerfile` that builds every app, tuned for each
  package manager: `pnpm fetch` + offline install, `npm ci`, or a Bun image. Node 26,
  port 3000.

## `project` schematic

- Options:
  - `part` (`client` | `server`, required)
  - `name` / `workspaceName`: the package name becomes `<workspace>-<name>`, or just `<name>`
    for a standalone project
  - `directory`: the full destination path, with nothing appended
  - `workspace`, `hasServer`, `docker`, `strict`, `language`, `packageManager`
  - `editor`: for now it only adds an `nf editor` section to the README
- `docker` is ignored inside a workspace, because the workspace's own Dockerfile builds the
  project.

### Generated entry file

```ts
import { NanoforgeFactory, type ClientRunOptions } from "nanoforge";
import { EcsLibrary } from "@nanoforge-dev/ecs/client";
import { Graphics2DLibrary } from "@nanoforge-dev/graphics-2d";
import { InputLibrary } from "@nanoforge-dev/input";
import { NetworkClientLibrary } from "@nanoforge-dev/network/client";

export const main = async (options: ClientRunOptions): Promise<void> => {
  const app = NanoforgeFactory.createClient({ tickRate: 60 });

  const ecs = new EcsLibrary();
  app.use(ecs);
  app.use(new Graphics2DLibrary());
  app.use(new InputLibrary());
  app.use(new NetworkClientLibrary());

  await app.init(options);
  // spawn entities, add systems…
  await app.run();
};
```

- It targets the **engine v2 API**: the `nanoforge` meta-package with `NanoforgeFactory`,
  run-option types and `Context`, and libraries added with `app.use(...)`.
- Client/server variants now use **subpath exports**: `@nanoforge-dev/ecs/<part>` and
  `@nanoforge-dev/network/<part>`, instead of `@nanoforge-dev/ecs-client` / `ecs-server`.
- `Registry` and the editor manifest types come from `@nanoforge-dev/ecs`. `Context` comes from
  `nanoforge`, no longer from `@nanoforge-dev/common`.
- Default libraries: the client gets ECS, Graphics 2D, Input and Network. The server gets ECS
  and Network. The v1 default save also included AssetManager and Music.

### Demo game: the server owns the state

The v1 placeholder (`ExampleComponent` / `exampleSystem`, which stopped the app after a
countdown) is replaced by a small multiplayer loop:

| Project | Components                        | Systems                                                                            |
| ------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| client  | `Position2D`, `DrawableCircle2D`  | `draw2D`: draws every drawable at its position                                     |
| client  | —                                 | `positionSync` (only with `hasServer`): applies positions received over TCP        |
| server  | `Position2D`                      | `move2D`: moves the entity and broadcasts `{x, y}` with `network.tcp.sendToEverybody` |

Components and systems still export an editor manifest and a default export of their name,
the same as in v1.

### Dependencies

- client `devDependencies`: `nanoforge`, `@nanoforge-dev/ecs`, `@nanoforge-dev/graphics-2d`,
  `@nanoforge-dev/input`, `@nanoforge-dev/network`.
- server: `@nanoforge-dev/network` is a runtime **`dependency`** (#226). `nanoforge` and
  `@nanoforge-dev/ecs` are `devDependencies`.
- **Version lookup at generation time** (`fetchTrustedVersion(s)`): the npm registry is
  queried, and only stable versions published **at least 48 hours ago** are picked (the same
  idea as pnpm's `minimumReleaseAge`). Lookups time out after 3 s. If a lookup fails, engine
  packages fall back to `^2`, the CLI to `latest` and TypeScript to `6.0.3`.

## Breaking changes

- The `application`, `configuration`, `part-base`, `part-main` and `docker` schematics are
  removed. Use `workspace` + `project`.
- Save files (`.nanoforge/*.save.json`) are no longer generated or read. Entry files are
  scaffolded once.
- `init/` hook files and the `initFunctions` behaviour are removed.
- Generated configs are `nanoforge.config.ts` / `.js` (`@nanoforge-dev/config` format), no
  longer `nanoforge.config.json`.
- Generated code targets the engine v2 packages.

## Tests & docs

- E2E suites for `workspace`, `project`, `component` and `system`, and unit tests for the
  registry, naming, formatting and object helpers.
- New docs section *Schematics*: overview, workspace, project, component, system.
- Built with tsdown and part of the Turborepo pipeline. Requires Node 26.

## Known issues

- **`component` / `system` templates still use v1 imports:** `@nanoforge-dev/ecs-<part>` and
  `@nanoforge-dev/common`. The system template also imports `../components/example.component`,
  which v2 projects don't have. Code generated by `nf create` in a v2 project won't compile.
- **The workspace `package.json` scripts run `nf dev -r`, `nf build -r` and `nf start -r`,**
  but the CLI has no `-r` option.
- **`project` declares options it ignores:** `libs`, `allowBuilds` (hardcoded to
  `workspace ? [] : ["bun"]`) and `initFunctions`, which is left over from v1.
- Generated configs import `defineConfig` from `nanoforge/config`, and the entry file imports
  the engine v2 packages. Neither is published yet.

## Commits

### Features

- Put network lib in dependencies (#226) ([e2dde26](https://github.com/NanoForge-dev/CLI/commit/e2dde2607736949caf85a057135c23fed8408861)) by @Exeloo
- Add new project and workspace schematics and remove old ones (#216) ([f551392](https://github.com/NanoForge-dev/CLI/commit/f551392a843d592b1efc70cf4613f98f616999b0)) by @Exeloo
- Add schematics (#200) ([330b9be](https://github.com/NanoForge-dev/CLI/commit/330b9bee1084c911aad8291c25aa591f0eb0d340)) by @Exeloo

### Refactor

- **cli:** Change create command to fit the new architecture (#222) ([3afb463](https://github.com/NanoForge-dev/CLI/commit/3afb463c96d7e511e492a6c8cbe82b686d837a08)) by @Exeloo
- **cli:** Change start command to fit the new architecture (#220) ([3acb4a1](https://github.com/NanoForge-dev/CLI/commit/3acb4a1e214426a1f5e953774859eba38ca49ffa)) by @Exeloo
- Change build cmd to new archi (#219) ([6700f71](https://github.com/NanoForge-dev/CLI/commit/6700f71e9d500efea0eb80aaad655623415f489b)) by @Exeloo
- **cli:** Change new cmd to new archi (#218) ([a2e0d1f](https://github.com/NanoForge-dev/CLI/commit/a2e0d1ffe60063d3f5ae22ed78718e7592fe0f72)) by @Exeloo

# [2.2.0](https://github.com/NanoForge-dev/schematics/compare/2.1.4...2.2.0) - (2026-06-30)

## Features

- Add pnpm workspace in app schematic (#155) ([5e0924d](https://github.com/NanoForge-dev/schematics/commit/5e0924d217c6ca62e322627f4adee79470c7bf2f)) by @Exeloo
- Add assets to entity generation (#153) ([a008fc6](https://github.com/NanoForge-dev/schematics/commit/a008fc6784cc4d15f3f09fc41efd9a0ea658c3a5)) by @Exeloo
- Graphics 2d editor generation (#154) ([89059f7](https://github.com/NanoForge-dev/schematics/commit/89059f7fbb5a505f3669bc691acbf377abd51fa6)) by @Exeloo

# [2.1.4](https://github.com/NanoForge-dev/schematics/compare/1.0.2...2.1.4) - (2026-06-29)

## Bug Fixes

- Issues (#139) ([131e794](https://github.com/NanoForge-dev/schematics/commit/131e794601b9fdcb583ac52eab9ca44a1cf8531f)) by @Exeloo
- **synchronize-docs:** Use actions key to have the rights (#127) ([f73464d](https://github.com/NanoForge-dev/schematics/commit/f73464d09f08f14f2c82960fe9cef2dfde7c00dc)) by @MartinFillon
- Give package json path (#124) ([a31e265](https://github.com/NanoForge-dev/schematics/commit/a31e26522078c9b60a63d3d91f1eccda96dadac7)) by @MartinFillon
- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46
- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo
- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo
- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo
- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo
- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Documentation

- Fix docs path (#140) ([fead8fd](https://github.com/NanoForge-dev/schematics/commit/fead8fd1e12ff872a5056f791dcaa7013bd135db)) by @Exeloo
- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add new release workflow (#137) ([af6c1e0](https://github.com/NanoForge-dev/schematics/commit/af6c1e0a9d49cb0cf46bbe6edde02ccfde04bc89)) by @Exeloo
- Use new docs actions to synchronize config (#123) ([fa3f4ec](https://github.com/NanoForge-dev/schematics/commit/fa3f4ece55b281bb37771b2f1fe5580ff5f707fc)) by @MartinFillon
- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo
- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo
- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo
- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo
- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon
- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

### New Contributors

- @MartinFillon made their first contribution in #151
- @github-actions[bot] made their first contribution in #150
- @dependabot[bot] made their first contribution in #143
- @Tchips46 made their first contribution in #113

# [2.1.4](https://github.com/NanoForge-dev/schematics/compare/1.0.2...2.1.4) - (2026-06-29)

## Bug Fixes

- Issues (#139) ([131e794](https://github.com/NanoForge-dev/schematics/commit/131e794601b9fdcb583ac52eab9ca44a1cf8531f)) by @Exeloo
- **synchronize-docs:** Use actions key to have the rights (#127) ([f73464d](https://github.com/NanoForge-dev/schematics/commit/f73464d09f08f14f2c82960fe9cef2dfde7c00dc)) by @MartinFillon
- Give package json path (#124) ([a31e265](https://github.com/NanoForge-dev/schematics/commit/a31e26522078c9b60a63d3d91f1eccda96dadac7)) by @MartinFillon
- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46
- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo
- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo
- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo
- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo
- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Documentation

- Fix docs path (#140) ([fead8fd](https://github.com/NanoForge-dev/schematics/commit/fead8fd1e12ff872a5056f791dcaa7013bd135db)) by @Exeloo
- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add new release workflow (#137) ([af6c1e0](https://github.com/NanoForge-dev/schematics/commit/af6c1e0a9d49cb0cf46bbe6edde02ccfde04bc89)) by @Exeloo
- Use new docs actions to synchronize config (#123) ([fa3f4ec](https://github.com/NanoForge-dev/schematics/commit/fa3f4ece55b281bb37771b2f1fe5580ff5f707fc)) by @MartinFillon
- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo
- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo
- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo
- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo
- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon
- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

### New Contributors

- @MartinFillon made their first contribution in #149
- @dependabot[bot] made their first contribution in #143
- @github-actions[bot] made their first contribution in #114
- @Tchips46 made their first contribution in #113

# [@nanoforge-dev/schematics@2.1.3](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.2...@nanoforge-dev/schematics@2.1.3) - (2026-04-19)

## Bug Fixes

- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46

# [@nanoforge-dev/schematics@2.1.2](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.1...@nanoforge-dev/schematics@2.1.2) - (2026-04-17)

## Bug Fixes

- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo

## Features

- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo

# [@nanoforge-dev/schematics@2.1.1](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.0...@nanoforge-dev/schematics@2.1.1) - (2026-04-02)

## Bug Fixes

- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo

# [@nanoforge-dev/schematics@2.1.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.0.0...@nanoforge-dev/schematics@2.1.0) - (2026-04-02)

## Bug Fixes

- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo

## Features

- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo

### New Contributors

- @Tchips46 made their first contribution in #100

# [@nanoforge-dev/schematics@2.0.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.2...@nanoforge-dev/schematics@2.0.0) - (2026-03-17)

## Features

- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.2](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.1...@nanoforge-dev/schematics@1.2.2) - (2026-03-15)

## Bug Fixes

- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.1](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.0...@nanoforge-dev/schematics@1.2.1) - (2026-03-15)

## Bug Fixes

- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Features

- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.1.0...@nanoforge-dev/schematics@1.2.0) - (2026-02-27)

## Features

- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon

### New Contributors

- @MartinFillon made their first contribution in #75
- @dependabot[bot] made their first contribution in #76

# [@nanoforge-dev/schematics@1.1.0](https://github.com/NanoForge-dev/schematics/tree/@nanoforge-dev/schematics@1.1.0) - (2026-02-19)

## Documentation

- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

# [1.0.2](https://github.com/NanoForge-dev/schematics/compare/1.0.1...1.0.2) - (2025-12-06)

## Bug Fixes

- Split ecs between client and server (#38) ([086d42f](https://github.com/NanoForge-dev/schematics/commit/086d42f1639cc764fb6f21c6ce8d9426ec2581e7)) by @Exeloo

# [1.0.1](https://github.com/NanoForge-dev/schematics/compare/1.0.0...1.0.1) - (2025-12-04)

## Bug Fixes

- **configuration:** Simplify schema and change defaults (#34) ([af29b00](https://github.com/NanoForge-dev/schematics/commit/af29b0011ae078dc75c9625e8f470f8506a7c7cb)) by @Exeloo

# [1.0.0](https://github.com/NanoForge-dev/schematics/compare/0.0.1...1.0.0) - (2025-11-30)

## Bug Fixes

- Change exports in package json and update schema paths (#17) ([b78b72a](https://github.com/NanoForge-dev/schematics/commit/b78b72a40b2287d841a3cac90adb0d37b4493d4e)) by @Exeloo

## Features

- **schematics:** Add part-main schematics for generating client/server main files (#29) ([6f34c1c](https://github.com/NanoForge-dev/schematics/commit/6f34c1c0f70d67eb78645108a665f7c5ebab8086)) by @Exeloo
- **schematics:** Replace client by base-part schematics to handle server (#20) ([c5ad539](https://github.com/NanoForge-dev/schematics/commit/c5ad539d7ac524de724c49dfa6b0e7b310700a44)) by @Exeloo
- **schematics:** Add client base schematics (#19) ([f02b26d](https://github.com/NanoForge-dev/schematics/commit/f02b26db6be9226857fbf3fe0ffe1abf6de31024)) by @Exeloo

### New Contributors

- @renovate[bot] made their first contribution in #27

# [0.0.1](https://github.com/NanoForge-dev/schematics/tree/0.0.1) - (2025-11-28)

## Features

- Add base application and configuration schematics (#12) ([d881653](https://github.com/NanoForge-dev/schematics/commit/d881653dd57a886f12e18b9acf0d48d31d3686e6))
- Init schematics project (#11) ([3fb0e61](https://github.com/NanoForge-dev/schematics/commit/3fb0e61075cf8094309765a0f685d2411c7f8aa8)) by @Exeloo

### New Contributors

- @Exeloo made their first contribution in #11
