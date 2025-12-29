# NanoForge CLI

## Commands

The nanoforge client interface has multiple commands usable :

```sh
nanoforge-cli [command] [options]
```

### build

Used to build your nanoforge project.

`-d, --directory [directory]` specify the directory of the nanoforge project to build.
`-c, --config [config]` path to the config file.
`--client-outDir [clientDirectory]` specifies the client directory.
`--server-outDir [serverDirectory]` specifies the server directory.

### generate

Used to generate nanoforge project files from config

`-d, --directory [directory]` specify the directory of the nanoforge project to build.
`-c, --config [config]` path to the config file.

### install|add

Used to add a nanoforge library to your project

`-d, --directory [directory]` specify the directory of the nanoforge project to build.

### new

Used to create a new nanoforge project

`-d, --directory [directory]` specify the directory of your project
`--name [name]` specify the name of your project
`--path [path]` specify the path of your project
`--package-manager [packageManager]` specify the package manager of your project
`--language [language]` specify the language of your project
`--strict` use strict mode
`--no-strict` do not use strict mode
`--server` create a server
`--no-server` do not create a server
`--init-functions` initialize functions
`--no-init-functions` do not initialize functions
`--skip-install` skip installing dependencies
`--no-skip-install` do not skip installing dependencies

### start

Used to start your nanoforge project

`-d, --directory [directory]` specify the directory of your project
`-c, --config [config]` path to the config file (default: "nanoforge.config.json")
`-p, --client-port [clientPort]` specify the port of the loader (the website to load the game)
`--game-exposure-port [gameExposurePort]` specify the port of the game exposure
`--server-port [serverPort]` specify the port of the server

## Config file

The config file schema
