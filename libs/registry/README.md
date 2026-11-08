<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/CLI/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/registry"><img src="https://img.shields.io/npm/v/@nanoforge-dev/registry.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/registry"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/registry.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml/badge.svg" alt="Release status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/commits/main/libs/registry"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/CLI.svg?logo=github&logoColor=ffffff&path=libs%2Fregistry" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/CLI.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

`@nanoforge-dev/registry` is the NanoForge registry client and installer, shared by the CLI (`nf install`, `nf publish`, `nf unpublish`) and the NanoForge Editor. It reads and publishes packages and plugins on the registry (npm's routes, zip archives with a `nanoforge.manifest.json` at their root), and installs a project's packages read-only into `nf_modules/@scope/name`, from `nanoforge.packages.json` and its lock.

## Installation

**Node.js 26 or newer is required.**

```sh
npm install @nanoforge-dev/registry
yarn add @nanoforge-dev/registry
pnpm add @nanoforge-dev/registry
bun add @nanoforge-dev/registry
```

## Usage

```ts
import { ProjectPackages, RegistryClient } from "@nanoforge-dev/registry";

// The API's origin: the routes are absolute (`/registry/…`), a path in `baseUrl` is dropped.
const registry = new RegistryClient({ baseUrl: "https://api.nanoforge.eu" });
const packages = new ProjectPackages(process.cwd(), registry);

await packages.install("@acme/kit");
```

Publishing takes a registry key:

```ts
import { RegistryClient, zipFolder } from "@nanoforge-dev/registry";

const registry = new RegistryClient({
  baseUrl: "https://api.nanoforge.eu",
  headers: () => ({ authorization: `Bearer ${key}` }),
});

await registry.whoami(); // { username, scopes }
await registry.publish("@acme/kit", await zipFolder("kit", { ignore: (path) => path === ".env" }));
await registry.unpublish("@acme/kit", "1.2.0");
```

- `RegistryClient` only talks to the origin of `baseUrl`, redirects included: a `dist.tarball` or a redirect elsewhere is refused (`INVALID`). A registry that keeps its archives on another host lists it in `archiveOrigins`. Give `baseUrl` the exact origin the API writes its archive addresses with (its `API_BASE_URL`): `http://localhost:3000` and `http://127.0.0.1:3000` are two origins.
- `@nanoforge-dev/registry/types` holds the schemas and types only (no Node code), for browser code.
- `@nanoforge-dev/registry/tsconfig-paths` edits the `paths` of a `tsconfig.json`.

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
[source]: https://github.com/NanoForge-dev/CLI/tree/main/libs/registry
[npm]: https://www.npmjs.com/package/@nanoforge-dev/registry
[contributing]: https://github.com/NanoForge-dev/CLI/blob/main/.github/CONTRIBUTING.md
