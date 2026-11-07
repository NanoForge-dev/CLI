---
name: scaffold-game
description: Uses the nf CLI (built from this repo's source code) to scaffold a Nanoforge project, component, or system via the schematics, in order to test the generators during CLI development. Use when the user asks to create a new test project, an ECS component/system, or to verify that a generator works.
---

# Scaffolding via the nf CLI (local build)

This skill uses the `nf` binary built from this repo's sources (not a version published on npm), to test the schematics (`libs/schematics`) during CLI development.

## 1. Build the CLI

```bash
pnpm install --frozen-lockfile
pnpm run build   # tsc --noEmit && tsdown -> dist/nf.js
```

## 2. Discover the exact command before using it

Do not assume the exact syntax of the options: always check the help before running a scaffolding command, as the flags may evolve with the repo.

```bash
node dist/nf.js --help
node dist/nf.js new --help
node dist/nf.js create --help
```

Detailed command documentation is also in `docs/docs/commands/` (one page per command), and the available schematics are listed in `libs/schematics/src/collection.json` (application, configuration, part-base, part-main, component, system, docker).

## 3. Scaffold in an isolated test directory

Run the chosen command from a test directory **outside this repo** (for example `/tmp` or the scratchpad), never at the root of the CLI repo itself:

```bash
cd /path/to/a/test/folder
node /absolute/path/to/repos/CLI/dist/nf.js new <project-name>
```

For a component/system inside an already-generated project, move into that project and then use the `create` command (check its exact usage via `--help`, see step 2).

## 4. Verify the result

Inspect the generated files (`ls`, `cat`) and compare them against the expected schema in `libs/schematics/src/libs/<schematic-name>/` (the corresponding schematic's `files/` files) to confirm that the applied template is correct.

## Out of scope for this skill

- Never publish a package (`nf publish`) or touch the real package registry without the user's explicit confirmation.
- Do not modify the global user configuration (`nf login`/`nf logout`) without an explicit request.
