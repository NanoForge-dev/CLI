# Changelog

All notable changes to this project will be documented in this file.

# [4.0.0](https://github.com/NanoForge-dev/CLI/compare/2.3.1...4.0.0) - (2026-11-08)

## Breaking Changes

- **cli:** Install, publish and unpublish on the shared registry lib (#263) ([9fb3abf](https://github.com/NanoForge-dev/CLI/commit/9fb3abfc4ff9c8630acb7a559be3129da04af221)) by @Exeloo
  - **BREAKING CHANGE:** nf install drops --server, and installs into nf_modules instead of copying files into client/ or server/. Manifests must use the registry format (@scope/name, version, type package or plugin): publish.paths and the scope/name format are no longer read.

## Bug Fixes

- **registry:** Keep every request on the registry's origin (#264) ([2ac2f42](https://github.com/NanoForge-dev/CLI/commit/2ac2f424027fac18a6951513dc401990f63f252b)) by @Exeloo

# [3.0.0](https://github.com/NanoForge-dev/CLI/compare/2.3.1...3.0.0) - (2026-11-08)

## Breaking Changes

- **cli:** Install, publish and unpublish on the shared registry lib (#263) ([9fb3abf](https://github.com/NanoForge-dev/CLI/commit/9fb3abfc4ff9c8630acb7a559be3129da04af221)) by @Exeloo
  - **BREAKING CHANGE:** nf install drops --server, and installs into nf_modules instead of copying files into client/ or server/. Manifests must use the registry format (@scope/name, version, type package or plugin): publish.paths and the scope/name format are no longer read.

## Bug Fixes

- **registry:** Keep every request on the registry's origin (#264) ([2ac2f42](https://github.com/NanoForge-dev/CLI/commit/2ac2f424027fac18a6951513dc401990f63f252b)) by @Exeloo

# Changelog

All notable changes to this project will be documented in this file.
