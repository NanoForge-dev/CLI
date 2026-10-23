---
name: scaffold-game
description: Utilise le CLI nf (construit depuis le code source de ce repo) pour scaffolder un projet, composant ou system Nanoforge via les schematics, afin de tester les générateurs pendant le développement du CLI. À utiliser quand l'utilisateur demande de créer un nouveau projet de test, un composant/system ECS, ou de vérifier qu'un générateur fonctionne.
---

# Scaffolding via le CLI nf (build local)

Ce skill utilise le binaire `nf` construit depuis les sources de ce repo (pas une version publiée sur npm), pour tester les schematics (`libs/schematics`) pendant le développement du CLI.

## 1. Builder le CLI

```bash
pnpm install --frozen-lockfile
pnpm run build   # tsc --noEmit && tsdown -> dist/nf.js
```

## 2. Découvrir la commande exacte avant de l'utiliser

Ne pas supposer la syntaxe exacte des options : toujours vérifier l'aide avant d'exécuter une commande de scaffolding, les flags pouvant évoluer avec le repo.

```bash
node dist/nf.js --help
node dist/nf.js new --help
node dist/nf.js create --help
```

La documentation détaillée des commandes est aussi dans `docs/docs/commands/` (une page par commande) et les schematics disponibles sont listés dans `libs/schematics/src/collection.json` (application, configuration, part-base, part-main, component, system, docker).

## 3. Scaffolder dans un répertoire de test isolé

Exécuter la commande choisie depuis un répertoire de test **en dehors de ce repo** (par exemple `/tmp` ou le scratchpad), jamais à la racine du repo CLI lui-même :

```bash
cd /chemin/vers/un/dossier/de/test
node /chemin/absolu/vers/repos/CLI/dist/nf.js new <nom-du-projet>
```

Pour un composant/system à l'intérieur d'un projet déjà généré, se placer dans ce projet puis utiliser la commande `create` (vérifier son usage exact via `--help`, voir étape 2).

## 4. Vérifier le résultat

Inspecter les fichiers générés (`ls`, `cat`) et comparer avec le schéma attendu dans `libs/schematics/src/libs/<nom-du-schematic>/` (fichiers `files/` du schematic correspondant) pour confirmer que le template appliqué est correct.

## Hors scope de ce skill

- Ne publie jamais de package (`nf publish`) ni ne touche au registre de packages réel sans confirmation explicite de l'utilisateur.
- Ne modifie pas la configuration globale utilisateur (`nf login`/`nf logout`) sans demande explicite.
