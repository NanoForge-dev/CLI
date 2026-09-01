<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/Loader/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-server"><img src="https://img.shields.io/npm/v/@nanoforge-dev/loader-server.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-server"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/loader-server.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/commits/main/apps/server"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/Loader.svg?logo=github&logoColor=ffffff&path=apps%2Fserver" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/Loader.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This package contains the Server Loader of NanoForge. It is part of the [NanoForge Loader][loader-source] monorepo. Check [releases][github-releases] to see versions. NanoForge is a powerful game engine for web browsers.

The server loader is a Node.js process that runs the server-side game code of a NanoForge project. It scans a compiled game directory, then forks an isolated worker process that loads `main.js` and calls its exported `main()` function.

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

## How It Works

The server loader runs in two processes:

1. **Server** (`server.js`) — the entry point. It scans the game directory, locates `/main.js`, and forks the worker. In `--watch` mode it restarts the worker whenever a file changes.
2. **Worker** (`worker.js`) — the isolated child process. It requires the game's `main.js` and calls `main({ files, env })`, where `files` is a map of all game file paths and `env` contains the forwarded environment variables.

## Options

| Option            | Default             | Description                                      |
| ----------------- | ------------------- | ------------------------------------------------ |
| `-d, --dir <dir>` | `.nanoforge/server` | Directory of compiled server game files          |
| `--watch`         | `false`             | Enable file watcher and worker restart on change |

## Watch Mode

When `--watch` is enabled, the loader watches the game directory recursively. On any file change, the running worker is killed and a new worker is immediately forked with a fresh state. Changes are debounced to 100 ms to avoid redundant restarts during bulk builds.

## Environment Variables

The server loader reads all environment variables prefixed with `NANOFORGE_`, strips the prefix, and passes them to the game as a plain object:

```
NANOFORGE_MY_VAR=hello  →  { MY_VAR: "hello" }
```

These variables are available inside the game via the `env` field of the `main()` options.

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
