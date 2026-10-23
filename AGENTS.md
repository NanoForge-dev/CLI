# CLI

## Rôle

Ce repo contient le CLI (`nf`) de NanoForge, un moteur de jeu pour navigateur. Le CLI est l'outil en ligne de commande utilisé par les développeurs pour créer, développer, builder, démarrer, publier et gérer des projets NanoForge (et leurs composants/systèmes), ainsi que pour lancer l'éditeur et interagir avec le registre de packages NanoForge.

## Stack technique

- **Langage** : TypeScript (Node.js 26), package publié en ESM (`"type": "module"`)
- **Framework CLI** : [Commander](https://github.com/tj/commander.js), avec une séparation Command/Action maison (voir Conventions), prompts interactifs via `@inquirer/prompts`
- **Génération de code** : Angular DevKit Schematics (`@angular-devkit/schematics`, `@angular-devkit/schematics-cli`) pour générer projets, composants, systèmes et workspaces
- **Runtime d'exécution des projets** : Bun (le CLI embarque/utilise `bun` comme dépendance)
- **Build** : [tsdown](https://github.com/sxzz/tsdown) (bundler basé sur Rolldown) + vérification de types via `tsc --noEmit`
- **Monorepo** : pnpm workspaces + [Turborepo](https://turbo.build) pour orchestrer build/lint/format/test entre le package racine et les libs internes
- **Gestionnaire de paquets** : pnpm (avec catalogues de versions `pnpm-workspace.yaml`)
- **Environnement dev reproductible** : Nix (`flake.nix` : Node 24, pnpm, bun)
- **Dépendances internes au repo** (`workspace:*`) : `@nanoforge-dev/config` (lib de gestion de configuration, package `libs/config` de ce repo) et `@nanoforge-dev/schematics` (lib de schematics, package `libs/schematics` de ce repo)
- **Dépendances externes publiées notables** : `@nanoforge-dev/editor` (`catalog:core`), `@nanoforge-dev/loader-client` et `@nanoforge-dev/loader-server` (`catalog:loader`)

## Structure du projet

```
src/
├── bin/nf.ts                 # point d'entrée exécutable du binaire `nf`
├── command/                    # définition des commandes Commander (interface CLI)
│   ├── abstract.command.ts
│   ├── command.loader.ts
│   └── commands/                 # build, create, dev, editor, install, login, logout,
│                                   #   new, publish, start, unpublish
├── action/                    # logique métier exécutée par chaque commande
│   ├── abstract.action.ts
│   └── actions/                  # une action par commande (build, create, dev, ...)
└── lib/                      # bibliothèques internes partagées
    ├── config/                    # chargement/résolution de la config projet
    ├── global-config/              # config globale utilisateur (ex: credentials)
    ├── git/                          # intégration git (ex: init de repo via --git)
    ├── http/                          # client HTTP (vers l'API NanoForge / registre)
    ├── manifest/                        # lecture du manifest de projet
    ├── package-manager/                   # détection/abstraction npm/yarn/pnpm/bun
    ├── question/                            # prompts interactifs (questions/questions)
    ├── registry/                              # interactions avec le registre de packages
    ├── runner/                                  # exécution de process enfants (build/dev/start)
    ├── schematics/                                # pont vers les schematics Angular DevKit
    ├── tree-kill/                                   # kill récursif d'arbres de process
    ├── ui/                                            # affichage terminal (spinners, couleurs)
    ├── input/, types/, utils/                           # helpers d'entrée utilisateur, types partagés, utilitaires génériques
    └── constants.ts                                       # constantes partagées

libs/                        # packages internes publiés séparément (workspace pnpm)
├── config/                    # @nanoforge-dev/config : définition/validation/merge de config
│   └── src/{defaults,define-config,merge,parse,types}
└── schematics/                 # @nanoforge-dev/schematics : schematics (component, project, system, workspace, plugin)
    └── src/{libs,utils,collection.json}

docs/                         # documentation (Docusaurus-like .mdx) + JSON Schemas publics
├── docs/{getting-started,configuration,commands,schematics}/
├── guides/cli/                  # guides pas-à-pas (créer un projet, dev local, build & déploiement, publier un package...)
└── *.schema.json                # schémas JSON du fichier de config, du manifest, etc.

e2e/                          # tests end-to-end du binaire compilé (spawn du process `nf`)
```

## Commandes principales

Le binaire généré s'utilise ainsi : `nf [command] [options]` (ex. `nf new`, `nf build`, `nf dev`, `nf editor`, `nf install`, `nf login`, `nf publish`...). Documentation complète des commandes dans `docs/docs/commands/`.

Développement du CLI lui-même (depuis la racine du repo) :
```bash
pnpm run build          # tsc --noEmit && tsdown
pnpm run build:dev       # build en mode développement
pnpm run start              # node dist/nf.js
pnpm run lint                 # prettier --check + eslint
pnpm run format                 # prettier --write + eslint --fix
pnpm run test                     # unit + e2e
pnpm run test:unit                  # vitest (vitest.config.ts)
pnpm run test:e2e                     # vitest (vitest.config.e2e.ts), exécute le binaire buildé
pnpm run changelog                      # git-cliff
pnpm run release                          # @favware/cliff-jumper
```

Orchestration monorepo (racine + `libs/*` via Turborepo) :
```bash
pnpm run repo:build          # turbo run build (concurrency 5)
pnpm run repo:lint             # turbo run lint
pnpm run repo:format             # turbo run format
pnpm run repo:test                 # turbo run test:unit puis test:e2e
```

## Conventions

- **Architecture Commande/Action** : chaque commande (`command/commands/*.command.ts`) ne fait que déclarer l'interface Commander (arguments/options) et délègue l'exécution à une classe Action correspondante (`action/actions/*.action.ts`) héritant de `abstract.action.ts` — séparation stricte interface CLI / logique métier.
- **Style de code** : config partagée via les packages externes publiés `@nanoforge-dev/utils-eslint-config` et `@nanoforge-dev/utils-prettier-config` (`catalog:lint`), avec `@trivago/prettier-plugin-sort-imports` pour l'ordre des imports (`@lib/*`, `@utils/*`, `~/*`, puis imports relatifs).
- **Commits** : Conventional Commits, vérifiés par Commitlint et des hooks Husky (`lint-staged` sur les fichiers stagés).
- **Releases** : `git-cliff` pour le changelog, `@favware/cliff-jumper` pour le bump de version, workflows GitHub Actions dédiés (`release.yml`, `pre-release.yml`, `alpha-release.yml` pour des releases alpha).
- **Variables d'environnement des projets générés** : convention de préfixes exposée aux jeux buildés par le CLI — `NANOFORGE_CLIENT_*` (client uniquement), `NANOFORGE_SERVER_*` (serveur uniquement), `NANOFORGE_*` (les deux) ; les préfixes sont retirés avant exposition aux libs consommatrices.
- **Schéma de configuration** : le fichier de config d'un projet généré est validé contre des JSON Schemas publiés (`docs/*.schema.json`), accessibles publiquement via `https://nanoforge-dev.github.io/docs/cli/config-schema.json`.
