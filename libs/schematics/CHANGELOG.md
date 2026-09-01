# Changelog

All notable changes to this project will be documented in this file.

# [2.2.0](https://github.com/NanoForge-dev/schematics/compare/2.1.4...2.2.0) - (2026-06-30)

## Features

- Add pnpm workspace in app schematic (#155) ([5e0924d](https://github.com/NanoForge-dev/schematics/commit/5e0924d217c6ca62e322627f4adee79470c7bf2f)) by @Exeloo
- Add assets to entity generation (#153) ([a008fc6](https://github.com/NanoForge-dev/schematics/commit/a008fc6784cc4d15f3f09fc41efd9a0ea658c3a5)) by @Exeloo
- Graphics 2d editor generation (#154) ([89059f7](https://github.com/NanoForge-dev/schematics/commit/89059f7fbb5a505f3669bc691acbf377abd51fa6)) by @Exeloo

# [2.1.4](https://github.com/NanoForge-dev/schematics/compare/1.0.2...2.1.4) - (2026-06-29)

## Bug Fixes

- Issues (#139) ([131e794](https://github.com/NanoForge-dev/schematics/commit/131e794601b9fdcb583ac52eab9ca44a1cf8531f)) by @Exeloo
- **synchronize-docs:** Use actions key to have the rights (#127) ([f73464d](https://github.com/NanoForge-dev/schematics/commit/f73464d09f08f14f2c82960fe9cef2dfde7c00dc)) by @MartinFillon
- Give package json path (#124) ([a31e265](https://github.com/NanoForge-dev/schematics/commit/a31e26522078c9b60a63d3d91f1eccda96dadac7)) by @MartinFillon
- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46
- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo
- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo
- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo
- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo
- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Documentation

- Fix docs path (#140) ([fead8fd](https://github.com/NanoForge-dev/schematics/commit/fead8fd1e12ff872a5056f791dcaa7013bd135db)) by @Exeloo
- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add new release workflow (#137) ([af6c1e0](https://github.com/NanoForge-dev/schematics/commit/af6c1e0a9d49cb0cf46bbe6edde02ccfde04bc89)) by @Exeloo
- Use new docs actions to synchronize config (#123) ([fa3f4ec](https://github.com/NanoForge-dev/schematics/commit/fa3f4ece55b281bb37771b2f1fe5580ff5f707fc)) by @MartinFillon
- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo
- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo
- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo
- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo
- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon
- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

### New Contributors

- @MartinFillon made their first contribution in #151
- @github-actions[bot] made their first contribution in #150
- @dependabot[bot] made their first contribution in #143
- @Tchips46 made their first contribution in #113

# [2.1.4](https://github.com/NanoForge-dev/schematics/compare/1.0.2...2.1.4) - (2026-06-29)

## Bug Fixes

- Issues (#139) ([131e794](https://github.com/NanoForge-dev/schematics/commit/131e794601b9fdcb583ac52eab9ca44a1cf8531f)) by @Exeloo
- **synchronize-docs:** Use actions key to have the rights (#127) ([f73464d](https://github.com/NanoForge-dev/schematics/commit/f73464d09f08f14f2c82960fe9cef2dfde7c00dc)) by @MartinFillon
- Give package json path (#124) ([a31e265](https://github.com/NanoForge-dev/schematics/commit/a31e26522078c9b60a63d3d91f1eccda96dadac7)) by @MartinFillon
- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46
- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo
- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo
- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo
- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo
- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Documentation

- Fix docs path (#140) ([fead8fd](https://github.com/NanoForge-dev/schematics/commit/fead8fd1e12ff872a5056f791dcaa7013bd135db)) by @Exeloo
- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add new release workflow (#137) ([af6c1e0](https://github.com/NanoForge-dev/schematics/commit/af6c1e0a9d49cb0cf46bbe6edde02ccfde04bc89)) by @Exeloo
- Use new docs actions to synchronize config (#123) ([fa3f4ec](https://github.com/NanoForge-dev/schematics/commit/fa3f4ece55b281bb37771b2f1fe5580ff5f707fc)) by @MartinFillon
- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo
- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo
- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo
- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo
- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon
- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

### New Contributors

- @MartinFillon made their first contribution in #149
- @dependabot[bot] made their first contribution in #143
- @github-actions[bot] made their first contribution in #114
- @Tchips46 made their first contribution in #113

# [@nanoforge-dev/schematics@2.1.3](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.2...@nanoforge-dev/schematics@2.1.3) - (2026-04-19)

## Bug Fixes

- **template:** New format (#113) ([1e89de7](https://github.com/NanoForge-dev/schematics/commit/1e89de7a536f75783c260cf1a0f0b05f99ffcf97)) by @Tchips46

# [@nanoforge-dev/schematics@2.1.2](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.1...@nanoforge-dev/schematics@2.1.2) - (2026-04-17)

## Bug Fixes

- Remove name formatting on app (#110) ([9478843](https://github.com/NanoForge-dev/schematics/commit/9478843b45a97714070babc6a7d41b8a9a6f2f65)) by @Exeloo

## Features

- Add dom to application schema tsconfig (#111) ([368fa7c](https://github.com/NanoForge-dev/schematics/commit/368fa7cdd94027fa9b8cc23516654bd6bb3a0beb)) by @Exeloo

# [@nanoforge-dev/schematics@2.1.1](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.1.0...@nanoforge-dev/schematics@2.1.1) - (2026-04-02)

## Bug Fixes

- Change save format in part base schematic (#105) ([6eaffe8](https://github.com/NanoForge-dev/schematics/commit/6eaffe8d94ce99727a8c27e1f7d5e3fa39a787ca)) by @Exeloo

# [@nanoforge-dev/schematics@2.1.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@2.0.0...@nanoforge-dev/schematics@2.1.0) - (2026-04-02)

## Bug Fixes

- **docker:** Change base image as alpine doesnt have the right libs (#102) ([3b8c2b2](https://github.com/NanoForge-dev/schematics/commit/3b8c2b2476210b3df6a08415bb5f18b7cbdaf970)) by @MartinFillon
- Remove ts types in js example system in part base (#93) ([89555b4](https://github.com/NanoForge-dev/schematics/commit/89555b46ffa8f3a4e2f157ecd9fabb2202de1cd7)) by @Exeloo

## Features

- Add component and system schematics (#103) ([38c90df](https://github.com/NanoForge-dev/schematics/commit/38c90df9bbe971da83aaa0338f39f875695083cf)) by @Exeloo
- **editor:** Add component holding entity id (#100) ([433c648](https://github.com/NanoForge-dev/schematics/commit/433c64851faafaf4198ac56801d09b47cce150c4)) by @Tchips46
- **save:** Allow partial saves component values as record string any (#98) ([9280349](https://github.com/NanoForge-dev/schematics/commit/9280349d9028d99028ab529e3c477cfd11d14606)) by @Tchips46
- Set save params types to any (#96) ([7a29579](https://github.com/NanoForge-dev/schematics/commit/7a29579e03fc1c4ca2ebc7794b4b3dd60167f741)) by @Exeloo

### New Contributors

- @Tchips46 made their first contribution in #100

# [@nanoforge-dev/schematics@2.0.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.2...@nanoforge-dev/schematics@2.0.0) - (2026-03-17)

## Features

- Add core editor to dependencies (#90) ([29cfa08](https://github.com/NanoForge-dev/schematics/commit/29cfa0864ee4a84fdc5aed5e790da454334dd2d5)) by @Exeloo
- Add better handling of path option (#89) ([1e0c469](https://github.com/NanoForge-dev/schematics/commit/1e0c469f98aac91d81e21d20e36a7d9e7a94df8b)) by @Exeloo
  - **BREAKING CHANGE:** Old schemas doesn't work anymore and config is changed
- Add editor option to part main schematic (#88) ([c59ed27](https://github.com/NanoForge-dev/schematics/commit/c59ed2710e2db2bcd3e5c553be9c80f5ad54b732)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.2](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.1...@nanoforge-dev/schematics@1.2.2) - (2026-03-15)

## Bug Fixes

- Fields does not replace on application (#86) ([d252953](https://github.com/NanoForge-dev/schematics/commit/d252953d4aef98a3ea505bb7bd45701f139d5599)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.1](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.2.0...@nanoforge-dev/schematics@1.2.1) - (2026-03-15)

## Bug Fixes

- Use of directory variable and js issues (#84) ([9d98d1a](https://github.com/NanoForge-dev/schematics/commit/9d98d1ae977e69cfc07b4e9131bde2ea2b34964f)) by @Exeloo

## Features

- Add lint param handling on application (#79) ([96c2128](https://github.com/NanoForge-dev/schematics/commit/96c212817d763fc2677d28cd57f3d196c6a45f6d)) by @Exeloo

# [@nanoforge-dev/schematics@1.2.0](https://github.com/NanoForge-dev/schematics/compare/@nanoforge-dev/schematics@1.1.0...@nanoforge-dev/schematics@1.2.0) - (2026-02-27)

## Features

- Setup docker schema (#75) ([cf7ead5](https://github.com/NanoForge-dev/schematics/commit/cf7ead5c49164a85e3beb65be3c73c842cd14e58)) by @MartinFillon

### New Contributors

- @MartinFillon made their first contribution in #75
- @dependabot[bot] made their first contribution in #76

# [@nanoforge-dev/schematics@1.1.0](https://github.com/NanoForge-dev/schematics/tree/@nanoforge-dev/schematics@1.1.0) - (2026-02-19)

## Documentation

- Add schematics docs (#61) ([7735324](https://github.com/NanoForge-dev/schematics/commit/7735324bcb5438929a24481e157677cc25f7457c)) by @Exeloo
- Fix contribution (#47) ([b6ad53e](https://github.com/NanoForge-dev/schematics/commit/b6ad53e9f77b6f6619b5090f08e9d3fb94e90a74)) by @Exeloo
- Add contributing docs and actions (#41) ([91eea94](https://github.com/NanoForge-dev/schematics/commit/91eea949ea785a03ca66d3a6e07d30d8e24df815)) by @Exeloo

## Features

- Add network and fix versions in app base (#70) ([6d5963a](https://github.com/NanoForge-dev/schematics/commit/6d5963a954e7a27c442377ecb70716a43e479717)) by @Exeloo
- Update and add pre-release (#48) ([49422f7](https://github.com/NanoForge-dev/schematics/commit/49422f7ad9e0595378cf6e8b44dc7711d09b8cfa)) by @Exeloo

## Testing

- Add unit tests and e2e tests (#67) ([8eef6b5](https://github.com/NanoForge-dev/schematics/commit/8eef6b51984d1187d3f0b936d670e362ad0224c6)) by @Exeloo

# [1.0.2](https://github.com/NanoForge-dev/schematics/compare/1.0.1...1.0.2) - (2025-12-06)

## Bug Fixes

- Split ecs between client and server (#38) ([086d42f](https://github.com/NanoForge-dev/schematics/commit/086d42f1639cc764fb6f21c6ce8d9426ec2581e7)) by @Exeloo

# [1.0.1](https://github.com/NanoForge-dev/schematics/compare/1.0.0...1.0.1) - (2025-12-04)

## Bug Fixes

- **configuration:** Simplify schema and change defaults (#34) ([af29b00](https://github.com/NanoForge-dev/schematics/commit/af29b0011ae078dc75c9625e8f470f8506a7c7cb)) by @Exeloo

# [1.0.0](https://github.com/NanoForge-dev/schematics/compare/0.0.1...1.0.0) - (2025-11-30)

## Bug Fixes

- Change exports in package json and update schema paths (#17) ([b78b72a](https://github.com/NanoForge-dev/schematics/commit/b78b72a40b2287d841a3cac90adb0d37b4493d4e)) by @Exeloo

## Features

- **schematics:** Add part-main schematics for generating client/server main files (#29) ([6f34c1c](https://github.com/NanoForge-dev/schematics/commit/6f34c1c0f70d67eb78645108a665f7c5ebab8086)) by @Exeloo
- **schematics:** Replace client by base-part schematics to handle server (#20) ([c5ad539](https://github.com/NanoForge-dev/schematics/commit/c5ad539d7ac524de724c49dfa6b0e7b310700a44)) by @Exeloo
- **schematics:** Add client base schematics (#19) ([f02b26d](https://github.com/NanoForge-dev/schematics/commit/f02b26db6be9226857fbf3fe0ffe1abf6de31024)) by @Exeloo

### New Contributors

- @renovate[bot] made their first contribution in #27

# [0.0.1](https://github.com/NanoForge-dev/schematics/tree/0.0.1) - (2025-11-28)

## Features

- Add base application and configuration schematics (#12) ([d881653](https://github.com/NanoForge-dev/schematics/commit/d881653dd57a886f12e18b9acf0d48d31d3686e6))
- Init schematics project (#11) ([3fb0e61](https://github.com/NanoForge-dev/schematics/commit/3fb0e61075cf8094309765a0f685d2411c7f8aa8)) by @Exeloo

### New Contributors

- @Exeloo made their first contribution in #11
