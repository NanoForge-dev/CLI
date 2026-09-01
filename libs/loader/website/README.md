<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/Loader/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-website"><img src="https://img.shields.io/npm/v/@nanoforge-dev/loader-website.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-website"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/loader-website.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/commits/main/apps/website"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/Loader.svg?logo=github&logoColor=ffffff&path=apps%2Fwebsite" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/Loader.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This package contains the Website Loader of NanoForge. It is part of the [NanoForge Loader][loader-source] monorepo. Check [releases][github-releases] to see versions. NanoForge is a powerful game engine for web browsers.

The website loader is a browser application (HTML + TypeScript) bundled as static assets and served by `loader-client`. It is the loading screen the player sees before the game starts: it downloads the game files, caches them locally in the browser and then bootstraps the game.

## Usage

To use the NanoForge Loader, please refer to the [CLI documentation][cli-source]!

First, install the CLI:

```bash
npm install -g @nanoforge-dev/cli
```

Create a new project:

```bash
nf new
```

Then build and start it:

```bash
cd <path_to_my_project>
nf build
nf start
```

## Loading Sequence

When the browser opens the loader URL, the following steps happen in order:

1. **Fetch manifest** — requests `/manifest` to get the game version and the list of files.
2. **Verify cache** — checks whether the game files from the previous session are still present in the browser's Origin Private File System (OPFS).
3. **Download files** — if the cache is stale or missing, downloads each game file from `/game/*` and writes it into OPFS, showing a progress bar and the current file name.
4. **Fetch environment** — requests `/env` to get the `NANOFORGE_*` variables forwarded by the server.
5. **Bootstrap game** — dynamically imports `/main.js` from the local cache, calls its exported `main({ files, env, container })` and hides the loading screen.

If any step fails, the error message is displayed on screen instead of a blank page.

## Watch Mode

When the server enables watch mode, the manifest includes a WebSocket URL. The website loader connects to this URL and reloads the page automatically whenever it receives an `update` message — enabling live-reload during development.

## Requirements

The loader requires a **secure context** (HTTPS or `localhost`) because it uses the browser's Origin Private File System API to cache game files locally. Starting the client loader with `--cert` and `--key` satisfies this requirement in production.

## Contributing

Please read through our [contribution guidelines][contributing] before starting a pull request. We welcome contributions of all kinds, not just code! If you're stuck for ideas, look for the [good first issue][good-first-issue] label on issues in the repository. If you have any questions about the project, feel free to ask them on [Discussions][discussions]. Before creating your own issue or pull request, always check to see if one already exists! Don't rush contributions, take your time and ensure you're doing it correctly.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please ask on [Discussions][discussions].

[contributing]: https://github.com/NanoForge-dev/Loader/blob/main/.github/CONTRIBUTING.md
[discussions]: https://github.com/NanoForge-dev/Loader/discussions
[cli-source]: https://github.com/NanoForge-dev/CLI
[loader-source]: https://github.com/NanoForge-dev/Loader
[github-releases]: https://github.com/NanoForge-dev/Loader/releases
[good-first-issue]: https://github.com/NanoForge-dev/Loader/contribute
