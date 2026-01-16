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

- `-d, --directory [directory]` specify the directory of the nanoforge project to build.
- `-c, --config [config]` path to the config file.
- `--client-outDir [clientDirectory]` specifies the client directory.
- `--server-outDir [serverDirectory]` specifies the server directory.
- `--watch` build app in watching mode. (default : `false`)

### `dev`

Used to run your nanoforge project in dev mode.

- `-d, --directory [directory]` specify the directory of the nanoforge project to build.
- `--generate` generate app files from config, like generate command in dev mode. (default : `false`)

### `generate`

Used to generate nanoforge project files from config

- `-d, --directory [directory]` specify the directory of the nanoforge project to build.
- `-c, --config [config]` path to the config file.
- `--watch` generate app in watching mode. (default : `false`)

### `install` or `add`

Used to add a nanoforge library to your project

- `-d, --directory [directory]` specify the directory of the nanoforge project to build.

### `new`

Used to create a new nanoforge project

- `-d, --directory [directory]` specify the directory of your project
- `--name [name]` specify the name of your project
- `--path [path]` specify the path of your project
- `--package-manager [packageManager]` specify the package manager of your project
- `--language [language]` specify the language of your project
- `--strict` use strict mode
- `--no-strict` do not use strict mode
- `--server` create a server
- `--no-server` do not create a server
- `--init-functions` initialize functions
- `--no-init-functions` do not initialize functions
- `--skip-install` skip installing dependencies
- `--no-skip-install` do not skip installing dependencies

### `start`

Used to start your nanoforge project

- `-d, --directory [directory]` specify the directory of your project
- `-c, --config [config]` path to the config file (default: "nanoforge.config.json")
- `-p, --client-port [clientPort]` specify the port of the loader (the website to load the game)
- `--game-exposure-port [gameExposurePort]` specify the port of the game exposure
- `--server-port [serverPort]` specify the port of the server
- `--watch` run app in watching mode. (default : `false`)

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
