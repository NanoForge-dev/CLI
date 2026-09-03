<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/CLI/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/config"><img src="https://img.shields.io/npm/v/@nanoforge-dev/config.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/config"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/config.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml/badge.svg" alt="Release status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/commits/main/libs/config"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/CLI.svg?logo=github&logoColor=ffffff&path=libs%2Fconfig" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/CLI.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

`@nanoforge-dev/config` is a library with the config types and helpers used to define and resolve `nanoforge.config.ts` files across Nanoforge CLI.

## Installation

**Node.js 26 or newer is required.**

```sh
npm install @nanoforge-dev/config
yarn add @nanoforge-dev/config
pnpm add @nanoforge-dev/config
bun add @nanoforge-dev/config
```

## Usage

Wrap a `nanoforge.config.ts` file's default export in `defineConfig` to get type-checking and editor autocompletion:

```ts
import { defineConfig } from "@nanoforge-dev/config";

export default defineConfig({
  type: "client",
  entryFile: "src/main.ts",
  libs: ["../../libs/my-lib"],
});
```

The `type` field discriminates between the four config shapes:

- `workspace` — a monorepo root listing its `packages`.
- `lib` — a shared library consumed by clients/servers.
- `client` — a browser-side NanoForge app.
- `server` — a server-side NanoForge app.

Each config type has partial, optional fields. `resolveConfig` (and its per-type variants `resolveWorkspaceConfig`, `resolveLibConfig`, `resolveClientConfig`, `resolveServerConfig`) fill in missing fields with defaults, deep-merging nested objects like `dir` and `out`:

```ts
import { resolveConfig } from "@nanoforge-dev/config";

const resolved = resolveConfig({ type: "client", dir: { assets: "static" } });
// resolved.dir.assets === "static"
// resolved.dir.packages === "nf_modules" (default, not overridden)
```

Array fields (`packages`, `libs`) are replaced wholesale by an override rather than concatenated with the defaults.

## Links

- [GitHub][source]
- [npm][npm]

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation][documentation].  
See [the contribution guide][contributing] if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please don't hesitate to ask questions in [discussions][discussions].

[documentation]: https://github.com/NanoForge-dev/CLI
[discussions]: https://github.com/NanoForge-dev/CLI/discussions
[source]: https://github.com/NanoForge-dev/CLI/tree/main/libs/config
[npm]: https://www.npmjs.com/package/@nanoforge-dev/config
[contributing]: https://github.com/NanoForge-dev/CLI/blob/main/.github/CONTRIBUTING.md
