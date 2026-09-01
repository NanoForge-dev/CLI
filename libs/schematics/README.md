<div align="center">
    <br />
    <p>
        <a href="https://github.com/NanoForge-dev"><img src="https://github.com/NanoForge-dev/CLI/blob/main/.github/logo.png" width="546" alt="NanoForge" /></a>
    </p>
    <br />
    <p>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/schematics"><img src="https://img.shields.io/npm/v/@nanoforge-dev/schematics.svg?maxAge=3600" alt="npm version" /></a>
        <a href="https://www.npmjs.com/package/@nanoforge-dev/schematics"><img src="https://img.shields.io/npm/dt/@nanoforge-dev/schematics.svg?maxAge=3600" alt="npm downloads" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml"><img src="https://github.com/NanoForge-dev/CLI/actions/workflows/release.yml/badge.svg" alt="Release status" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/commits/main"><img src="https://img.shields.io/github/last-commit/NanoForge-dev/CLI.svg?logo=github&logoColor=ffffff" alt="Last commit" /></a>
        <a href="https://github.com/NanoForge-dev/CLI/graphs/contributors"><img src="https://img.shields.io/github/contributors/NanoForge-dev/CLI.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="Contributors" /></a>
    </p>
</div>

## About

This repository contains the Schematics of NanoForge. Check [releases][github-releases] to see versions of the Schematics. Nanoforge is a powerful game engine for web browser.

## Usage

To use Nanoforge Schematics, please refer to the [CLI documentation][cli-source] !

First, install the CLI :

```bash
npm install -g @nanoforge-dev/cli
```

And then create a new project :

```bash
nf new
```

## Schematics

This repository provide multiples schematics, usable with Angular Devkit schematics.

- `application` : Base of a Nanoforge app
- `configuration` : Template of `nanoforge.config.json` with premade fields
- `part-base` : Base of Nanoforge client or server
- `part-main` : Client or server `main.ts` from a config
- `component` : ECS component class for a client or server part
- `system` : ECS system function for a client or server part
- `docker` : Dockerfile and `.dockerignore` tailored to your package manager

## Contributing

Please read through our [contribution guidelines][contributing] before starting a pull request. We welcome contributions of all kinds, not just code! If you're stuck for ideas, look for the [good first issue][good-first-issue] label on issues in the repository. If you have any questions about the project, feel free to ask them on [Discussions][discussions]. Before creating your own issue or pull request, always check to see if one already exists! Don't rush contributions, take your time and ensure you're doing it correctly.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle nudge in the right direction, please ask on [Discussions][discussions].

[contributing]: https://github.com/NanoForge-dev/CLI/blob/main/.github/CONTRIBUTING.md
[discussions]: https://github.com/NanoForge-dev/CLI/discussions
[cli-source]: https://github.com/NanoForge-dev/CLI
[github-releases]: https://github.com/NanoForge-dev/CLI/releases
[good-first-issue]: https://github.com/NanoForge-dev/CLI/contribute
