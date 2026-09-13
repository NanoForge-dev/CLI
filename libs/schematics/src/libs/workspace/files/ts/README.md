# <%= name %>

A [NanoForge](https://nanoforge.eu) game workspace.

## Prerequisites

- Node.js and <%= packageManager %>
- The [NanoForge CLI](https://www.npmjs.com/package/@nanoforge-dev/cli): `npm install -g @nanoforge-dev/cli`

## Install

```bash
<%= packageManager %> install
```

## Structure

This is the root of your NanoForge monorepo. `nanoforge.config.ts` lists the app packages, and each
client or server app lives under `apps/<part>` (generated separately with the `project` schematic).

## Development

```bash
nf dev -r
```

`-r` runs the command across every app in the workspace. `nf dev` serves the game and watches your
files, so changes are picked up as you work. Target a single app instead with `-d apps/<part>`.

## Build & start

```bash
nf build -r
nf start -r
```

`nf build` compiles every app for production, and `nf start` serves the build.

## CLI reference

| Command    | Description                          |
| ---------- | ------------------------------------- |
| `nf dev`   | Develop with hot reload               |
| `nf build` | Build for production                  |
| `nf start` | Run a built app                       |
| `-r`       | Apply the command to every app        |

## More info

- [Documentation](https://docs.nanoforge.eu) - CLI commands, configuration, and guides
- [nanoforge.eu](https://nanoforge.eu) - learn more about NanoForge
