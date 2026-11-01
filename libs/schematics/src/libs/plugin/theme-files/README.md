# <%= title %>

A NanoForge editor theme (`<%= name %>`), with no code: everything is in `nanoforge.manifest.json`.

- `contributes.themes`: the theme. It `extends` the editor's dark theme and gives only the colors it changes; give `kind` and every color to start from nothing. `syntax` colors the code, `tokens` changes fonts and corners.
- `contributes.icons`: icons as SVG files of the plugin, by name. `contributes.iconThemes` replaces the editor's icons and gives file and folder icons.

The editor checks the theme's contrast when it is applied: text that falls under 4.5:1 is named in its Console.

## Run it in the editor

```sh
pnpm dev                                  # copies the manifest and icons to dist/ on every change
DEV_PLUGINS=$(pwd) nf editor <a project>  # in another terminal: the editor reloads the theme
```

Choose it in _Settings › Editor › Appearance_.

## Publish it

`keywords: ["theme"]` lists it under _Get more themes_ in the editor's marketplace. The plugin authoring guide has the list of colors and tokens.
