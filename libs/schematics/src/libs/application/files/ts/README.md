# <%= name %>

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Package manager: **<%= packageManager %>**
- [NanoForge CLI](https://www.npmjs.com/package/@nanoforge-dev/cli): `<%= packageManager %> install -g @nanoforge-dev/cli`

---

## Installation

```bash
<%= packageManager %> install
```

---

## Development

Start the game in watch mode with hot reload:

```bash
nf dev
```

<% if (editor) { %>Open the visual editor (optional — lets you edit entities, components and systems without touching code):
```bash
nf editor
```

<% } %>---

## Project structure

```
<%= name %>/
├── .nanoforge/             # NanoForge internal save files (do not edit manually)
├── client/                 # Client-side code (runs in the browser)
│   ├── static/             # Static assets
│   ├── components/         # ECS components
│   ├── systems/            # ECS systems<% if (initFunctions) { %>
│   └── init/               # Lifecycle hooks (before-init, after-run, …)<% } %><% if (server) { %>
├── server/                 # Server-side code
│   ├── static/
│   ├── components/
│   ├── systems/<% if (initFunctions) { %>
│   └── init/<% } %><% } %>
├── package.json
├── tsconfig.json
└── nanoforge.config.json   # Game configuration
```

---

## Modifying the game

### Add a component

```bash
nf generate component <name> --part client
```

A component is a plain class that holds data for an entity. Edit the generated file in `client/components/`:

```ts
export class MyComponent {
  constructor(public speed: number) {}
}

export default MyComponent.name;
```

### Add a system

```bash
nf generate system <name> --part client
```

A system is a function that runs every tick and operates on entities that have specific components. Edit the generated file in `client/systems/`:

```ts
import { type Context } from "@nanoforge-dev/common";
import { type Registry } from "@nanoforge-dev/ecs-client";
import { MyComponent } from "../components/my.component";

export const mySystem = (registry: Registry, ctx: Context) => {
  const entities = registry.getZipper([MyComponent]);

  entities.forEach((entity) => {
    entity.MyComponent.speed += 1;
  });
};

export default mySystem.name;
```

<% if (server) { %>
### Server-side code

Server components and systems live in `server/` and are imported from `@nanoforge-dev/ecs-server`. They follow the same pattern as the client side.

Configure the server connection in `.env`:

| Variable                              | Default     | Description                     |
|---------------------------------------|-------------|---------------------------------|
| `NANOFORGE_CLIENT_SERVER_ADDRESS`     | `127.0.0.1` | Server address (client-side)    |
| `NANOFORGE_CLIENT_SERVER_TCP_PORT`    | `4444`      | TCP port the client connects to |
| `NANOFORGE_CLIENT_SERVER_UDP_PORT`    | `4445`      | UDP port the client connects to |
| `NANOFORGE_SERVER_LISTENING_TCP_PORT` | `4444`      | TCP port the server listens on  |
| `NANOFORGE_SERVER_LISTENING_UDP_PORT` | `4445`      | UDP port the server listens on  |

<% } %>---

## Build

Compile the game for production:

```bash
<%= packageManager %> run build
# or
nf build
```

Output is written to the `.nanoforge/` directory.

---

## Run

Start the game server and open it in a browser:

```bash
<%= packageManager %> run start
# or
nf start
```

<% if (lint) { %>---

## Code quality

```bash
# Check formatting and linting
<%= packageManager %> run lint

# Auto-fix formatting and linting
<%= packageManager %> run format
```

<% } %>---

## CLI reference

| Command                        | Description                               |
|--------------------------------|-------------------------------------------|
| `nf dev`                       | Start in development mode with hot reload |
| `nf build`                     | Build for production                      |
| `nf start`                     | Run the built game                        |
| `nf generate component <name>` | Scaffold a new component                  |
| `nf generate system <name>`    | Scaffold a new system                     |<% if (editor) { %>
| `nf editor`                    | Open the visual editor                    |<% } %>

Full CLI documentation: <https://docs.nanoforge.eu>
