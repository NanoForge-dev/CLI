# Usage

This document explains how to use the Nanoforge CLI to create, develop, and build a game project. It is written as a **workflow-first guide**, followed by a complete **command reference**.

## Quick Start

A typical Nanoforge development workflow looks like this:

1. Create a new project using `nf new`.
2. Start the development environment using `nf start`.
3. Develop your game while the dev server is running.
4. Build the game for production using `nf build`.

If you follow the steps above in order, you can successfully develop and build a Nanoforge game from scratch.

## Development Workflow

### Step 1: Create a New Project

Use the `nf new` command to scaffold a new Nanoforge project. This creates the project directory, initializes configuration files, and sets up the client and optional server structure.

### Step 2: Start Development Mode

Run `nf start` inside your project directory to start the development server. This command typically launches the client and server processes and watches for file changes.

### Step 3: Build for Production

Once development is complete, use `nf build` to generate optimized production assets.

## CLI Commands Reference

The following sections document each CLI command in detail.

# nf new

## Synopsis

::

nf new [options]

## Description

Creates a new Nanoforge project and initializes the required directory structure and configuration files.

## Options

`-d, --directory <path>`
Directory where the project will be created. Defaults to the current directory.

`--name <project-name>`
Name of the game project.

`--language <ts|js>`
Programming language for the project. Default is `ts`.

`--server / --no-server`
Enable or disable server scaffolding.

## Examples

::

nf new --name my-game --language ts

# nf start

## Synopsis

::

nf start [options]

## Description

Starts the Nanoforge development environment. This command runs the client and server in development mode and watches for file changes.

## Options

`--client-port <port>`
Port on which the client development server will run.

`--server-port <port>`
Port on which the server will run.

`--open`
Automatically open the game in a browser after startup.

## Examples

::

nf start
nf start --client-port 3000 --server-port 4000

# nf build

## Synopsis

::

nf build [options]

## Description

Builds the Nanoforge project for production. This command generates optimized assets based on the build configuration.

## Options

`-o, --output <directory>`
Output directory for the production build.

`--minify`
Enable asset minification.

`--sourcemap`
Generate source maps for debugging.

## Examples

::

nf build
nf build --output dist --minify

# nf generate

## Synopsis

::

nf generate <type> [options]

## Description

Generates project resources such as assets, entities, or boilerplate code.

## Arguments

`<type>`
Type of resource to generate.

## Options

`--name <resource-name>`
Name of the resource to generate.

## Examples

::

nf generate entity --name player

# nf install add

## Synopsis

::

nf install add <package>

## Description

Installs and adds a dependency or plugin to the Nanoforge project.

## Arguments

`<package>`
Name of the package to install.

## Options

`--dev`
Install the package as a development dependency.

## Examples

::

nf install add nanoforge-plugin-example

## Configuration

Nanoforge uses configuration files to control runtime and build behavior. These configuration files are typically created during project initialization.

Common configuration files include:

* `nanoforge.config.json` – Main project configuration
* Client configuration
* Server configuration
* Build configuration
* Run configuration

Commands that use configuration:

* `nf start` reads client and server configuration values.
* `nf build` reads build configuration values.

When both CLI flags and configuration values are provided, **CLI flags take precedence**.

## Notes

* Always run CLI commands from the root of your Nanoforge project.
* Ensure configuration files are valid before running build or start commands.
* Refer to configuration schema files for advanced configuration options.
# Usage

This document explains how to use the Nanoforge CLI to create, develop, and build a game project. It is written as a **workflow-first guide**, followed by a complete **command reference**.

## Quick Start (Happy Path)

A typical Nanoforge development workflow looks like this:

1. Create a new project using `nf new`.
2. Start the development environment using `nf start`.
3. Develop your game while the dev server is running.
4. Build the game for production using `nf build`.

If you follow the steps above in order, you can successfully develop and build a Nanoforge game from scratch.

## Development Workflow

### Step 1: Create a New Project

Use the `nf new` command to scaffold a new Nanoforge project. This creates the project directory, initializes configuration files, and sets up the client and optional server structure.

### Step 2: Start Development Mode

Run `nf start` inside your project directory to start the development server. This command typically launches the client and server processes and watches for file changes.

### Step 3: Build for Production

Once development is complete, use `nf build` to generate optimized production assets.

## CLI Commands Reference

The following sections document each CLI command in detail.

# nf new

## Synopsis

::

nf new [options]

## Description

Creates a new Nanoforge project and initializes the required directory structure and configuration files.

## Options

`-d, --directory <path>`
Directory where the project will be created. Defaults to the current directory.

`--name <project-name>`
Name of the game project.

`--language <ts|js>`
Programming language for the project. Default is `ts`.

`--server / --no-server`
Enable or disable server scaffolding.

## Examples

::

nf new --name my-game --language ts

# nf start

## Synopsis

::

nf start [options]

## Description

Starts the Nanoforge development environment. This command runs the client and server in development mode and watches for file changes.

## Options

`--client-port <port>`
Port on which the client development server will run.

`--server-port <port>`
Port on which the server will run.

`--open`
Automatically open the game in a browser after startup.

## Examples

::

nf start
nf start --client-port 3000 --server-port 4000

# nf build

## Synopsis

::

nf build [options]

## Description

Builds the Nanoforge project for production. This command generates optimized assets based on the build configuration.

## Options

`-o, --output <directory>`
Output directory for the production build.

`--minify`
Enable asset minification.

`--sourcemap`
Generate source maps for debugging.

## Examples

::

nf build
nf build --output dist --minify

# nf generate

## Synopsis

::

nf generate <type> [options]

## Description

Generates project resources such as assets, entities, or boilerplate code.

## Arguments

`<type>`
Type of resource to generate.

## Options

`--name <resource-name>`
Name of the resource to generate.

## Examples

::

nf generate entity --name player

# nf install add

## Synopsis

::

nf install add <package>

## Description

Installs and adds a dependency or plugin to the Nanoforge project.

## Arguments

`<package>`
Name of the package to install.

## Options

`--dev`
Install the package as a development dependency.

## Examples

::

nf install add nanoforge-plugin-example

## Configuration

Nanoforge uses configuration files to control runtime and build behavior. These configuration files are typically created during project initialization.

Common configuration files include:

* `nanoforge.config.json` – Main project configuration
* Client configuration
* Server configuration
* Build configuration
* Run configuration

Commands that use configuration:

* `nf start` reads client and server configuration values.
* `nf build` reads build configuration values.

When both CLI flags and configuration values are provided, **CLI flags take precedence**.

## Notes

* Always run CLI commands from the root of your Nanoforge project.
* Ensure configuration files are valid before running build or start commands.
* Refer to configuration schema files for advanced configuration options.
