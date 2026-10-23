# AGENTS.md

Instructions for AI coding agents (Codex, Cursor, GitHub Copilot, Gemini CLI, Claude Code, ...)
working on this project. Human-oriented documentation lives in `README.md`.

## Project overview

`<%= packageName %>` is a [NanoForge](https://nanoforge.eu) **<%= part %>** app written in
JavaScript (ES modules, typed with JSDoc<% if (strict) { %>, strict checks enabled in `jsconfig.json`<% } %>),
using **<%= packageManager %>**.<% if (workspace) { %>
It is one app of a NanoForge workspace: read the workspace root `AGENTS.md` first.<% } %>

NanoForge is a web game engine built on an ECS (Entity Component System):

- **Entities** are plain ids spawned from the registry.
- **Components** are classes that only hold data, attached to entities.
- **Systems** are functions run every tick on the entities that have a given set of components.
- **Libraries** (graphics, input, network, ...) are plugged into the app with `app.use(...)`.

## Commands

| Task                         | Command                                          |
| ---------------------------- | ------------------------------------------------ |
| Install dependencies         | `<%= packageManager %> install`                  |
| Develop with hot reload      | `nf dev`                                         |
| Build for production         | `nf build` (output in `dist/`)                   |
| Run the built app            | `nf start`                                       |
| Scaffold a component         | `nf create component -n <Name>`                  |
| Scaffold a system            | `nf create system -n <name>`                     |
| Install a registry component | `nf install <name>`                              |<% if (editor) { %>
| Open the visual editor       | `nf editor .`                                    |<% } %>

<% if (workspace) { %>Install dependencies from the workspace root. <% } %>There is no test runner configured. After a change, run `nf build` to check that the project
still compiles.

## Project structure

```
.
├── assets/             # Static assets (images, sounds, ...)
├── src/
│   ├── main.js         # Entry point: creates the app, registers libraries, entities and systems
│   ├── components/     # ECS components (*.component.js)
│   └── systems/        # ECS systems (*.system.js)
├── nanoforge.config.js # NanoForge project configuration (type: "<%= part %>")
├── package.json
└── jsconfig.json
```

Do not edit generated or installed files: `dist/`, `.nanoforge/` and `nf_modules/`.

## Conventions

### Components

- One component per file in `src/components/`, named `<kebab-name>.component.js`.
- A component is a class with a `name = this.constructor.name;` field and its data assigned
  in the constructor. Document parameter types with JSDoc.
- Keep `export default <Component>.name;`: it is required by the code generation.
- Keep `EDITOR_COMPONENT_MANIFEST` in sync with the constructor parameters (same names, order
  and types): it is used by the editor.

```js
/**
 * @typedef {import("@nanoforge-dev/ecs").EditorComponentManifest} EditorComponentManifest
 */

export class Velocity2D {
  name = this.constructor.name;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default Velocity2D.name;

/** @type {EditorComponentManifest} */
export const EDITOR_COMPONENT_MANIFEST = {
  name: "Velocity2D",
  description: "Velocity of an entity in pixel per tick",
  params: [
    { type: "number", name: "x", description: "Horizontal velocity", example: 1, default: 0 },
    { type: "number", name: "y", description: "Vertical velocity", example: 1, default: 0 },
  ],
};
```

### Systems

- One system per file in `src/systems/`, named `<kebab-name>.system.js`.
- A system is a function `(registry, ctx) => void`. Query entities with
  `registry.getZipper([ComponentA, ComponentB])`.
- Keep `export default <system>.name;` and `EDITOR_SYSTEM_MANIFEST`, whose `dependencies` lists
  the names of the components the system reads.

```js
/**
 * @typedef {import("@nanoforge-dev/common").Context} Context
 * @typedef {import("@nanoforge-dev/ecs").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 */

import { Position2D } from "../components/position-2d.component";
import { Velocity2D } from "../components/velocity-2d.component";

/**
 * @param {Registry} registry
 * @param {Context} _ctx
 */
export function applyVelocity(registry, _ctx) {
  registry.getZipper([Position2D, Velocity2D]).forEach(({ Position2D, Velocity2D }) => {
    Position2D.x += Velocity2D.x;
    Position2D.y += Velocity2D.y;
  });
}

export default applyVelocity.name;

/** @type {EditorSystemManifest} */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "applyVelocity",
  description: "Moves entities according to their velocity",
  dependencies: ["Position2D", "Velocity2D"],
};
```

### Entry point

`src/main.js` exports `main(options)`, which:

1. creates the app with `NanoforgeFactory.<%= part === "client" ? "createClient" : "createServer" %>(...)`,
2. registers the libraries with `app.use(...)`, then calls `await app.init(options)`,
3. spawns entities with `registry.spawnEntity()` and `registry.addComponent(...)`,
4. registers systems with `registry.addSystem(...)`, then calls `await app.run()`.

Scaffolding a component or a system does not register it: add the system to `src/main.js`
yourself.

### Imports

- Types (JSDoc `import(...)` only): `@nanoforge-dev/common` (`Context`) and `@nanoforge-dev/ecs`
  (`Registry`, manifests).
- Libraries: `@nanoforge-dev/ecs/<%= part %>`, `@nanoforge-dev/network/<%= part %>`<% if (part === "client") { %>,
  `@nanoforge-dev/graphics-2d` and `@nanoforge-dev/input`<% } %>.

## Documentation

- NanoForge documentation: <https://docs.nanoforge.eu>
- CLI reference: `nf --help` and `nf <command> --help`
