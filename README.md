<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/CLI/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/cli"><img src="https://img.shields.io/npm/v/@nanoforge-dev/cli.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/cli"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/cli.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/push-docs.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/push-docs.yml/badge.svg" alt="Documentation status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/commits/main"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/CLI.svg?logo=github&logoColor=ffffff" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/CLI.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This repository contains the CLI of NanoForge. Check [releases][github-releases] to see versions of the CLI. Nanoforge is a powerful game engine for web browser.

## Usage

To use Nanoforge CLI, please refer to the [CLI documentation][cli-source] !

First, install the CLI :

```bash
npm install -g @nanoforge-dev/cli
```

And then create a new project :

```bash
nf new
```

## Documentation

The documentation for nanoforge cli can be found at : [https://nanoforge-dev.github.io/docs/cli](https://nanoforge-dev.github.io/docs/cli)

## Commands

The nanoforge client interface has multiple commands usable :

```sh
nf [command] [options]
```

### `build`

Used to build your nanoforge project.

- `-d, --directory <directory>` specify the working directory of the command.
- `-c, --config <config>` path to the config file.
- `--client-entry <clientEntry>` specify the entry file of the client.
- `--server-entry <serverEntry>` specify the entry file of the server.
- `--client-static-dir <clientStaticDir>` specify the static directory of the client.
- `--server-static-dir <serverStaticDir>` specify the static directory of the server.
- `--client-out-dir <clientOutDir>` specify the output directory of the client.
- `--server-out-dir <serverOutDir>` specify the output directory of the server.
- `--editor` build with editor config.
- `--watch` build app in watching mode. (default: `false`)

### `create`

Used to create nanoforge components or systems.

- `<type>` the type to create (component or system).
- `-d, --directory <directory>` specify the working directory of the command.
- `-c, --config <config>` path to the config file.
- `-n, --name <name>` name of the component/system.
- `-s, --server` create on server instead of client. (default: `false`)
- `-p, --path <path>` path to the component/system folder.

### `dev`

Used to run your nanoforge project in dev mode.

- `-d, --directory <directory>` specify the working directory of the command.
- `-c, --config <config>` path to the config file.
- `--generate` generate app files from config, like generate command in dev mode. (default: `false`)

### `editor`

Used to start the nanoforge editor.

- `[path]` path to the project to open in the editor.
- `-d, --directory <directory>` specify the working directory of the command.
- `--open` open the editor in the default web browser (default: `true` if path is specified, `false` otherwise).
- `--no-open` do not open the editor in the default web browser.

### `generate`

Used to generate nanoforge project files from config.

- `-d, --directory <directory>` specify the working directory of the command.
- `-c, --config <config>` path to the config file.
- `--editor` generate the editor main file.
- `--watch` generate app in watching mode. (default: `false`)

### `install` or `add`

Used to add nanoforge components, systems or libraries to your project.

- `[names...]` names of the components/systems/libraries to install.
- `-d, --directory <directory>` specify the working directory of the command.
- `-l, --lib` install a library instead of a component/system. (default: `false`)
- `-s, --server` install on server instead of client. (default: `false`)

### `login`

Used to log in to the Nanoforge registry.

- `-d, --directory <directory>` specify the working directory of the command.
- `-l, --local` log in only for the current project. (default: `false`)
- `-k, --api-key <key>` API key for the Nanoforge registry.

### `logout`

Used to log out from the Nanoforge registry.

- `-d, --directory <directory>` specify the working directory of the command.
- `-l, --local` log out only for the current project.

### `new`

Used to create a new nanoforge project.

- `-d, --directory <directory>` specify the working directory of the command.
- `--name <name>` specify the name of your project.
- `--path <path>` specify the relative path where your project will be created (default: name of the project).
- `--package-manager <packageManager>` specify the package manager of your project.
- `--language <language>` specify the language of your project.
- `--strict` use strict mode.
- `--no-strict` do not use strict mode.
- `--server` create a server.
- `--no-server` do not create a server.
- `--init-functions` initialize functions.
- `--no-init-functions` do not initialize functions.
- `--skip-install` skip installing dependencies.
- `--no-skip-install` do not skip installing dependencies.
- `--docker` generate docker files.
- `--no-docker` do not generate docker files.
- `--no-lint` do not generate lint files.
- `--editor` add editor dependencies.
- `--git` generate a git repository.
- `--no-git` do not generate a git repository.
- `--git-remote <gitRemote>` set up a git remote (required if `--git` is used).
- `--no-git-remote` do not set up a git remote.

### `publish`

Used to publish a package to the Nanoforge registry.

- `-d, --directory <directory>` specify the working directory of the command.

### `start`

Used to start your nanoforge project.

- `-d, --directory <directory>` specify the working directory of the command.
- `-c, --config <config>` path to the config file (default: "nanoforge.config.json").
- `-p, --port <port>` specify the port of the loader (the website to load the game).
- `--client-dir <clientDirectory>` specify the directory of the client.
- `--server-dir <serverDirectory>` specify the directory of the server.
- `--watch` run app in watching mode. (default: `false`)
- `--cert <cert>` path to the SSL certificate for HTTPS.
- `--key <key>` path to the SSL key for HTTPS.

### `unpublish`

Used to unpublish a package from the Nanoforge registry.

- `-d, --directory <directory>` specify the working directory of the command.

## Environment Variables

When running a NanoForge game with `nf start`, environment variables can be passed to the client and server applications via a `.env` file at the root of your project or directly in the environment.

```dotenv
NANOFORGE_CLIENT_SERVER_TCP_PORT=4445
NANOFORGE_CLIENT_SERVER_UDP_PORT=4444
NANOFORGE_CLIENT_SERVER_ADDRESS=127.0.0.1
```

Variables are scoped by prefix:

| Prefix              | Availability                        |
| :------------------ | :---------------------------------- |
| `NANOFORGE_CLIENT_` | Available in the client only        |
| `NANOFORGE_SERVER_` | Available in the server only        |
| `NANOFORGE_`        | Available in both client and server |

> **Note:** Prefixes are stripped before the variable is exposed to libraries.

For full documentation on how libraries consume these variables, see [@nanoforge-dev/config](https://github.com/NanoForge-dev/Engine/tree/main/packages/config).

## Contributing

Please read through our [contribution guidelines][contributing] before starting a pull request. We welcome contributions of all kinds, not just code! If you're stuck for ideas, look for the [good first issue][good-first-issue] label on issues in the repository. If you have any questions about the project, feel free to ask them on [Discussions][discussions]. Before creating your own issue or pull request, always check to see if one already exists! Don't rush contributions, take your time and ensure you're doing it correctly.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please ask on [Discussions][discussions].

[contributing]: https://github.com/NanoForge-dev/CLI/blob/main/.github/CONTRIBUTING.md
[discussions]: https://github.com/NanoForge-dev/CLI/discussions
[cli-source]: https://github.com/NanoForge-dev/CLI
[github-releases]: https://github.com/NanoForge-dev/CLI/releases
[good-first-issue]: https://github.com/NanoForge-dev/CLI/contribute

The config file schema can be found at : [https://nanoforge-dev.github.io/docs/cli/config-schema.json](https://nanoforge-dev.github.io/docs/cli/config-schema.json)
