Usage
=====

Creating a new project
----------------------

In order to create a new project you need to use:

.. code-block:: bash

	nf new

Commands
--------

Multiple commands exist in the CLI:

* :ref:`build`
* :ref:`create`
* :ref:`dev`
* :ref:`editor`
* :ref:`generate`
* :ref:`install_add`
* :ref:`login`
* :ref:`logout`
* :ref:`new`
* :ref:`publish`
* :ref:`start`
* :ref:`unpublish`

.. _build:

build
^^^^^

Used to build your nanoforge project.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-c, --config <config>`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``--client-entry <clientEntry>`` specify the entry file of the client.
* ``--server-entry <serverEntry>`` specify the entry file of the server.
* ``--client-static-dir <clientStaticDir>`` specify the static directory of the client.
* ``--server-static-dir <serverStaticDir>`` specify the static directory of the server.
* ``--client-out-dir <clientOutDir>`` specify the output directory of the client.
* ``--server-out-dir <serverOutDir>`` specify the output directory of the server.
* ``--editor`` build with editor config.
* ``--watch`` build app in watching mode. (default: ``false``)

.. _create:

create
^^^^^^

Used to create nanoforge components or systems.

* ``<type>`` the type to create (component or system).
* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-c, --config <config>`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``-n, --name <name>`` name of the component/system.
* ``-s, --server`` create on server instead of client. (default: ``false``)
* ``-p, --path <path>`` path to the component/system folder.

.. _dev:

dev
^^^

Used to run your nanoforge project in dev mode.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-c, --config <config>`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``--generate`` generate app files from config, like generate command in dev mode. (default: ``false``)

.. _editor:

editor
^^^^^^

Used to start the nanoforge editor.

* ``[path]`` path to the project to open in the editor.
* ``-d, --directory <directory>`` specify the working directory of the command.
* ``--open`` open the editor in the default web browser (default: ``true`` if path is specified, ``false`` otherwise).
* ``--no-open`` do not open the editor in the default web browser.

.. _generate:

generate
^^^^^^^^

Used to generate nanoforge project files from config.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-c, --config <config>`` path to the config file. (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``--editor`` generate the editor main file.
* ``--watch`` generate app in watching mode. (default: ``false``)

.. _install_add:

install/add
^^^^^^^^^^^

Used to add nanoforge components, systems or libraries to your project.

* ``[names...]`` names of the components/systems/libraries to install.
* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-l, --lib`` install a library instead of a component/system. (default: ``false``)
* ``-s, --server`` install on server instead of client. (default: ``false``)

.. _login:

login
^^^^^

Used to log in to the Nanoforge registry.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-l, --local`` log in only for the current project. (default: ``false``)
* ``-k, --api-key <key>`` API key for the Nanoforge registry.

.. _logout:

logout
^^^^^^

Used to log out from the Nanoforge registry.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-l, --local`` log out only for the current project.

.. _new:

new
^^^

Used to create a new nanoforge project.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``--name <name>`` specify the name of your project.
* ``--path <path>`` specify the relative path where your project will be created (default: name of the project).
* ``--package-manager <packageManager>`` specify the package manager of your project.
* ``--language <language>`` specify the language of your project.
* ``--strict`` use strict mode.
* ``--no-strict`` do not use strict mode.
* ``--server`` create a server.
* ``--no-server`` do not create a server.
* ``--init-functions`` initialize functions.
* ``--no-init-functions`` do not initialize functions.
* ``--skip-install`` skip installing dependencies.
* ``--no-skip-install`` do not skip installing dependencies.
* ``--docker`` generate docker files.
* ``--no-docker`` do not generate docker files.
* ``--no-lint`` do not generate lint files.
* ``--editor`` add editor dependencies.
* ``--git`` generate a git repository.
* ``--no-git`` do not generate a git repository.
* ``--git-remote <gitRemote>`` set up a git remote (required if ``--git`` is used).
* ``--no-git-remote`` do not set up a git remote.

.. _publish:

publish
^^^^^^^

Used to publish a package to the Nanoforge registry.

* ``-d, --directory <directory>`` specify the working directory of the command.

.. _start:

start
^^^^^

Used to start your nanoforge project.

* ``-d, --directory <directory>`` specify the working directory of the command.
* ``-c, --config <config>`` path to the config file (default: "nanoforge.config.json"). (`Schema <https://nanoforge-dev.github.io/docs/cli/config.schema.json>`__)
* ``-p, --port <port>`` specify the port of the loader (the website to load the game).
* ``--client-dir <clientDirectory>`` specify the directory of the client.
* ``--server-dir <serverDirectory>`` specify the directory of the server.
* ``--watch`` run app in watching mode. (default: ``false``)
* ``--cert <cert>`` path to the SSL certificate for HTTPS.
* ``--key <key>`` path to the SSL key for HTTPS.

.. _unpublish:

unpublish
^^^^^^^^^

Used to unpublish a package from the Nanoforge registry.

* ``-d, --directory <directory>`` specify the working directory of the command.

Environment Variables
---------------------

When running a NanoForge game (via ``nf start``), environment variables can be passed to the client and server applications through a ``.env`` file at the root of the project or directly in the environment.

.. code-block:: dotenv

    NANOFORGE_CLIENT_SERVER_TCP_PORT=4445
    NANOFORGE_CLIENT_SERVER_UDP_PORT=4444
    NANOFORGE_CLIENT_SERVER_ADDRESS=127.0.0.1

Variables are scoped by prefix:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Prefix
     - Availability
   * - ``NANOFORGE_CLIENT_``
     - Available in the client only
   * - ``NANOFORGE_SERVER_``
     - Available in the server only
   * - ``NANOFORGE_``
     - Available in both client and server

.. note::

    Prefixes are stripped before the variable is exposed to libraries.

For full documentation on how libraries consume these variables, see `@nanoforge-dev/config <https://github.com/NanoForge-dev/Engine/tree/main/packages/config>`__.
