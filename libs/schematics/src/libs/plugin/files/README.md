# <%= title %>

A NanoForge editor plugin (`<%= name %>`).

- `nanoforge.manifest.json`: what the plugin adds to the editor (a panel, a command, a menu entry, a setting).
- `src/index.ts`: `activate`, run when the panel is first shown or the command first runs.
- `src/Panel.svelte`: the panel.

## Run it in the editor

```sh
pnpm install
pnpm dev                                  # rebuilds dist/ on every change
DEV_PLUGINS=$(pwd) nf editor <a project>  # in another terminal: the editor reloads the plugin
```

The <%= title %> panel opens in the bottom right dock. _View › Panels › <%= title %>_ shows it again once closed, and _Edit › Add to the counter_ runs its command.

## Install it without the dev mode

Build it (`pnpm build`), then copy `dist/` to `~/.nanoforge/editor/plugins/<%= name %>` (every project) or to `<project>/.nanoforge/plugins/<%= name %>` (that project).

The plugin authoring guide has the rest: the manifest, the SDK, extension points, settings, history.
