<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/Loader/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-client"><img src="https://img.shields.io/npm/v/@nanoforge-dev/loader-client.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/loader-client"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/loader-client.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/Loader/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/commits/main/apps/client"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/Loader.svg?logo=github&logoColor=ffffff&path=apps%2Fclient" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/Loader/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/Loader.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This package contains the Client Loader of NanoForge. It is part of the [NanoForge Loader][loader-source] monorepo. Check [releases][github-releases] to see versions. NanoForge is a powerful game engine for web browsers.

The client loader is a Bun HTTP server that serves the browser-facing side of a NanoForge project. It delivers the loader UI, the compiled game files and the game environment to the browser, and optionally streams live-reload events via WebSocket.

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

## Routes

The client loader exposes the following HTTP routes:

| Route           | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| `GET /`         | Serves the `loader-website` HTML application                          |
| `GET /*`        | Serves static assets bundled with `loader-website`                    |
| `GET /manifest` | Returns the list of game files and the current version as JSON        |
| `GET /env`      | Returns `NANOFORGE_*` environment variables (prefix stripped) as JSON |
| `GET /game/*`   | Serves compiled game client files from the configured game directory  |

## Options

| Option                     | Default             | Description                                    |
| -------------------------- | ------------------- | ---------------------------------------------- |
| `-p, --port <port>`        | `3000`              | Port the HTTP server listens on                |
| `-d, --dir <dir>`          | `.nanoforge/client` | Directory of compiled client game files        |
| `--watch`                  | `false`             | Enable file watcher and browser hot-reload     |
| `--watch-port <port>`      | auto                | Port for the WebSocket watch server            |
| `--watch-server-dir <dir>` | —                   | Also watch a server game directory for changes |
| `--cert <file>`            | —                   | TLS certificate file (enables HTTPS)           |
| `--key <file>`             | —                   | TLS private key file (enables HTTPS)           |

## Watch Mode

When `--watch` is enabled, the client loader starts a WebSocket server on `--watch-port` (or a random free port). Any file change in the game directory causes the server to broadcast an `update` message. The `loader-website` frontend listens for this message and reloads the page automatically.

You can also pass `--watch-server-dir` to trigger a reload when the server game directory changes — useful when both sides are compiled simultaneously.

## HTTPS / TLS

Pass `--cert` and `--key` to enable HTTPS. The `loader-website` frontend will detect TLS and communicate this to the game via the `/env` response (`tlsEnabled: true`). HTTPS is required when the browser's secure context is enforced (e.g. to use the Origin Private File System).

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
