# <%= packageName %>

A [NanoForge](https://nanoforge.eu) <%= part %> app.
<% if (!workspace) { %>
## Prerequisites

- Node.js and <%= packageManager %>
- The [NanoForge CLI](https://www.npmjs.com/package/@nanoforge-dev/cli): `npm install -g @nanoforge-dev/cli`

## Install

```bash
<%= packageManager %> install
```
<% } %>
## Development

```bash
nf dev
```

`nf dev` serves the game and watches your files, so changes are picked up as you work.

## Build & start

```bash
nf build
nf start
```

`nf build` compiles this <%= part %> for production, and `nf start` serves the build.
<% if (editor) { %>
This app was generated with editor support. Launch it with:

```bash
nf editor .
```
<% } %><% if (docker) { %>
A `Dockerfile` is also included to containerize the built app for deployment.
<% } %>
## CLI reference

| Command       | Description                       |
| ------------- | ---------------------------------- |
| `nf dev`      | Develop with hot reload            |
| `nf build`    | Build for production               |
| `nf start`    | Run a built app                     |<% if (editor) { %>
| `nf editor`   | Launch the visual editor            |<% } %>

## More info

- [Documentation](https://docs.nanoforge.eu) - CLI commands, configuration, and guides
- [nanoforge.eu](https://nanoforge.eu) - learn more about NanoForge
