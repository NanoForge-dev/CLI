# AGENTS.md

Instructions for AI coding agents (Codex, Cursor, GitHub Copilot, Gemini CLI, Claude Code, ...)
working on this repository. Human-oriented documentation lives in `README.md`.

## Project overview

`<%= name %>` is a [NanoForge](https://nanoforge.eu) multiplayer game, organized as a
**<%= packageManager %>** workspace written in JavaScript (ES modules, typed with JSDoc).

NanoForge is a web game engine built on an ECS (Entity Component System): entities are ids,
components are data classes and systems are functions run every tick.

## Structure

```
.
├── apps/
│   ├── client/         # Browser app: rendering, input, receives the game state from the server
│   └── server/         # Authoritative game logic, broadcasts the game state to the clients
├── nanoforge.config.js # Workspace configuration (type: "workspace", lists the apps)
├── package.json
└── jsconfig.json       # Shared JavaScript configuration, extended by each app
```

Each app has its own `AGENTS.md` describing its layout and conventions: read it before
working inside `apps/<part>`.

## Commands

Run from the workspace root:

| Task                    | Command                                  |
| ----------------------- | ---------------------------------------- |
| Install dependencies    | `<%= packageManager %> install`          |
| Develop with hot reload | `<%= packageManager %> run dev`          |
| Build every app         | `<%= packageManager %> run build`        |
| Run every built app     | `<%= packageManager %> run start`        |

Target a single app with `-d apps/<part>`, e.g. `nf build -d apps/client`. Scaffold components
and systems from inside an app (`nf create component -n <Name> -d apps/client`), never from
the workspace root.

There is no test runner configured. After a change, run the build to check that every app
still compiles.

## Conventions

- Client and server communicate through `@nanoforge-dev/network` (`ctx.network` in systems).
  When you change the shape of a message sent by one side, update the other side too.
- Keep the game logic on the server; the client renders and sends input.
- Install dependencies from the root only; do not add a lockfile inside `apps/*`.
- Do not edit generated files: `dist/`, `.nanoforge/` and `nf_modules/`.

## Documentation

- NanoForge documentation: <https://docs.nanoforge.eu>
- CLI reference: `nf --help` and `nf <command> --help`
