# Changelog

All notable changes to this project will be documented in this file.

# [2.3.0](https://github.com/NanoForge-dev/CLI/compare/1.6.2...2.3.0) - (2026-09-24)

> First release of `@nanoforge-dev/config` from the CLI monorepo (`libs/config`). Earlier 1.x
> versions were published from the NanoForge Engine repository. This package replaces the CLI's
> built-in `nanoforge.config.json` handling, and it's what makes the new NanoForge v2 game
> architecture possible: a game is no longer one app with a `client` and a `server` part, but a
> set of projects, each with its own typed config.

## Why 2.3.0

The CLI, `@nanoforge-dev/config` and `@nanoforge-dev/schematics` now share **one version
number** and are released together. That shared version must be higher than the latest
published version of every package. `@nanoforge-dev/schematics` was already at **2.2.1**, so all
three packages are **aligned to the schematics version** and released as **2.3.0**. Config goes
from 1.4.2 straight to 2.3.0. There are no config 2.0.0, 2.1.x or 2.2.x releases.

## Why this package exists

In v1, one `nanoforge.config.json` at the root described the whole game. The CLI deep-merged
it with its own `CONFIG_DEFAULTS` and validated it with `class-transformer` / `class-validator`
decorators. Client and server were two sections of the same file, switched on with
`client.enable` / `server.enable`.

In v2, a NanoForge game is made of independent **projects** (`client`, `server`), optional
shared **libs**, and an optional **workspace** that groups them in a monorepo. Every one of
them has its **own** `nanoforge.config.ts` (or `.js`). This package defines what those files
look like, how they're loaded and validated, and what their defaults are. The CLI and your
editor both use it.

```
my-game/                                 # multiplayer game (workspace)
├── nanoforge.config.ts                  # { type: "workspace", packages: ["apps/*"] }
└── apps/
    ├── client/nanoforge.config.ts       # { type: "client" }
    └── server/nanoforge.config.ts       # { type: "server" }

my-game/                                 # single-player game (standalone project)
└── nanoforge.config.ts                  # { type: "client" }
```

## Config files are now typed modules

```ts
import { defineConfig } from "@nanoforge-dev/config";

export default defineConfig({
  type: "client",
  entryFile: "src/main.ts",
  libs: ["../../libs/shared"],
});
```

- **`defineConfig`** returns its argument unchanged. It exists only so your editor can
  type-check and autocomplete the config.
- **Loading:** `parseConfig(path)` imports the file with [`unrun`](https://github.com/unjs/unrun)
  (`bundle-require` preset), so TypeScript configs work without a separate build step. The
  file's **default export** is the config.
- **Validation:** the default export is checked against a **`zod`** schema: a discriminated
  union on `type`, with every field typed. Unknown `type` values or wrong field types are
  rejected.
- **Errors:** every failure throws a `ConfigParseError` with a `code`:

  | `code`              | When                                                  |
  | ------------------- | ----------------------------------------------------- |
  | `not-found`         | The file doesn't exist                                |
  | `load-failed`       | `unrun` couldn't import it (syntax error, it throws…) |
  | `no-default-export` | The module has no default export                      |
  | `invalid-type`      | The default export doesn't match the schema           |

## Four config types

`NanoforgeConfig` is a discriminated union keyed by `type`:

| `type`      | Role                                    | Fields                                                                                                                    |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `workspace` | Monorepo root                           | `packages: string[]`: globs for the project/lib directories                                                               |
| `client`    | Browser-side game project               | `entryFile`, `out.{dir,mainFile}`, `dir.{assets,packages,components,systems,scenes}`, `editor.entryFile`, `language`, `libs`, `port`, `tls` |
| `server`    | Server-side game project                | Same as `client`, without `port` and `tls`                                                                                |
| `lib`       | Shared code used by clients and servers | `dir.{assets,shared,components,systems,scenes}`                                                                           |

The `client` and `server` types are built from small **mixins**, and each mixin is exported as
its own type:

| Mixin              | Adds                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| `BuildableConfig`  | `entryFile`, `out.dir`, `out.mainFile`                                         |
| `SourceableConfig` | `dir.assets`, `dir.packages`, and `dir.components/systems/scenes` (editor only) |
| `EditorConfig`     | `editor.entryFile`: the entry used by `--editor`                               |
| `LanguageConfig`   | `language: "ts" \| "js"`: picks the component/system templates                  |
| `ContainLibConfig` | `libs: string[]`: relative paths to shared libs                                |
| `TlsConfig`        | `tls: { enable?: false } \| { enable: true, cert, key }` (client only)          |

## Defaults and resolution

`resolveConfig(config)` fills in missing fields with the defaults for the config's `type`.
There's also one helper per type: `resolveClientConfig`, `resolveServerConfig`,
`resolveLibConfig` and `resolveWorkspaceConfig`. The defaults themselves are exported as
`defaultClientConfig`, `defaultServerConfig`, `defaultLibConfig` and `defaultWorkspaceConfig`.

- Nested objects (`dir`, `out`, `editor`, `tls`) are **deep-merged**.
- Arrays (`packages`, `libs`) are **replaced**, not concatenated.

| Field (`client` / `server`) | Default          |
| --------------------------- | ---------------- |
| `entryFile`                 | `src/main.ts`    |
| `out.dir`                   | `dist`           |
| `out.mainFile`              | `main.js`        |
| `dir.assets`                | `assets`         |
| `dir.packages`              | `nf_modules`     |
| `dir.components`            | `src/components` |
| `dir.systems`               | `src/systems`    |
| `dir.scenes`                | `src/scenes`     |
| `editor.entryFile`          | `src/main.ts`    |
| `language`                  | `ts`             |
| `libs`                      | `[]`             |
| `port` (client)             | `3000`           |
| `tls.enable` (client)       | `false`          |

`lib` defaults: `dir.assets = assets`, `dir.shared = shared`, and `components` / `systems` /
`scenes` under `shared/`. `workspace` defaults: `packages = []`.

## How the CLI uses these configs

The CLI (`src/lib/config`) builds its **workspace resolution** on top of this package:

- If the root config is `client` / `server`, that project is the only target.
- If the root config is `workspace`, each `packages` glob is expanded and every matching
  directory's config is loaded:
  - A directory without a config is skipped.
  - A glob that matches nothing only logs a warning.
  - A nested `workspace` throws.
- If the root config is `lib`, it's rejected: a lib can't be an entry point.

`build`, `start` and `create` all go through this resolution. That's how one `nf build` or
`nf start` now handles every client and server project in a game.

## Migrating from `nanoforge.config.json` (v1)

| v1 (`nanoforge.config.json`)                    | v2 (`nanoforge.config.ts`)                                   |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `name`                                          | **Removed.** Use the project's `package.json` name           |
| `language`                                      | `language`, now **per project**                              |
| `initFunctions`                                 | **Removed**                                                  |
| `client.enable` / `server.enable`               | **Removed.** A project of that `type` exists or it doesn't   |
| `client.port`                                   | `port` on the `client` config                                |
| `<part>.outDir` (`.nanoforge/<part>`)           | `out.dir` (`dist`) + `out.mainFile`                          |
| `<part>.build.entry` (`<part>/main.ts`)         | `entryFile` (`src/main.ts`)                                  |
| `<part>.build.staticDir` (`<part>/static`)      | `dir.assets` (`assets`)                                      |
| `<part>.editor.entry` (`.nanoforge/editor/…`)   | `editor.entryFile` (`src/main.ts`)                           |
| `<part>.editor.save` (`.nanoforge/*.save.json`) | **Removed.** Entry files aren't generated from saves anymore |
| `<part>.dirs.components` / `.dirs.systems`      | `dir.components` / `dir.systems`                             |
| `ssl.{enable,cert,key}` (top level)             | `tls` on the **client** config                               |
| —                                               | **New:** `dir.scenes`, `dir.packages`, `libs`, `out.mainFile` |

To migrate, write one `nanoforge.config.ts` per project with the matching `type`. If your game
has a server, add a `workspace` config at the root that lists them in `packages`.

## Package

- Published as dual ESM/CJS with type declarations (`dist/index.{js,cjs,d.ts,d.cts}`).
- Runtime dependencies: `unrun`, `zod`.
- Requires Node 26.
- Released together with `@nanoforge-dev/cli` and `@nanoforge-dev/schematics`, which all
  share one version.

## Known issues

- Generated projects import `defineConfig` from **`nanoforge/config`** (the engine
  meta-package), but that path isn't published yet. `@nanoforge-dev/config` works today.
- `libs` (on projects) and `lib` configs are parsed and discovered, but the CLI's
  `build` / `start` don't use them yet.
- The configuration docs page says client and server "share the exact same fields". Its table
  is missing `port`, `tls`, `editor.entryFile` and `language`.

## Commits

### Features

- Add config parser (#214) ([cde54ab](https://github.com/NanoForge-dev/CLI/commit/cde54abba3a8b8385e6441bff8a39365dffde90c)) by @Exeloo
- Add schematics (#200) ([330b9be](https://github.com/NanoForge-dev/CLI/commit/330b9bee1084c911aad8291c25aa591f0eb0d340)) by @Exeloo
- Add config lib and monorepo config files (#197) ([197a75c](https://github.com/NanoForge-dev/CLI/commit/197a75c82699f8a90c14be03208bd6313f53886d)) by @Exeloo

### Refactor

- **cli:** Change create command to fit the new architecture (#222) ([3afb463](https://github.com/NanoForge-dev/CLI/commit/3afb463c96d7e511e492a6c8cbe82b686d837a08)) by @Exeloo
- **cli:** Change start command to fit the new architecture (#220) ([3acb4a1](https://github.com/NanoForge-dev/CLI/commit/3acb4a1e214426a1f5e953774859eba38ca49ffa)) by @Exeloo
- Change build cmd to new archi (#219) ([6700f71](https://github.com/NanoForge-dev/CLI/commit/6700f71e9d500efea0eb80aaad655623415f489b)) by @Exeloo

# Changelog

All notable changes to this project will be documented in this file.
