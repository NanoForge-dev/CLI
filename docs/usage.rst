Usage
=====

Creating a new project
----------------------

In order to create a new project you need to use:

.. code-block:: bash

	nf new

Commands
--------

Multiple commands exists to the cli:

* :ref:`build`
* :ref:`generate`
* :ref:`install_add`
* :ref:`new`
* :ref:`start`

.. _build:

build
^^^^^

Used to build your nanoforge project.

* ``-d, --directory [directory]`` specify the directory of the nanoforge project to build.
* ``-c, --config [config]`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``--client-outDir [clientDirectory]`` specifies the client directory.
* ``--server-outDir [serverDirectory]`` specifies the server directory.

.. _generate:

generate
^^^^^^^^

Used to generate nanoforge project files from config

* ``-d, --directory [directory]`` specify the directory of the nanoforge project to build.
* ``-c, --config [config]`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)

.. _install_add:

install/add
^^^^^^^^^^^

Used to add a nanoforge library to your project

* ``-d, --directory [directory]`` specify the directory of the nanoforge project to build.

.. _new:

new
^^^

Used to create a new nanoforge project

* ``-d, --directory [directory]`` specify the directory of your project
* ``--name [name]`` specify the name of your project
* ``--path [path]`` specify the path of your project
* ``--package-manager [packageManager]`` specify the package manager of your project
* ``--language [language]`` specify the language of your project
* ``--strict`` use strict mode
* ``--no-strict`` do not use strict mode
* ``--server`` create a server
* ``--no-server`` do not create a server
* ``--init-functions`` initialize functions
* ``--no-init-functions`` do not initialize functions
* ``--skip-install`` skip installing dependencies
* ``--no-skip-install`` do not skip installing dependencies

.. _start:

start
^^^^^

Used to start your nanoforge project

* ``-d, --directory [directory]`` specify the directory of your project
* ``-c, --config [config]`` path to the config file (default: "nanoforge.config.json") (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``-p, --client-port [clientPort]`` specify the port of the loader (the website to load the game)
* ``--game-exposure-port [gameExposurePort]`` specify the port of the game exposure
* ``--server-port [serverPort]`` specify the port of the server
