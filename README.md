# Keyboard Knight

Serious game de dactylographie en AZERTY, construit avec Vite, React et TypeScript.

## Prérequis

- Node.js 20.19+ ou 22.12+
- npm

## Démarrage

```sh
npm install
npm run dev
```

## Vérifications

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

## Architecture

- `src/engine/` : logique métier TypeScript pure, indépendante de React.
- `src/ui/` et `src/app/` : écrans React et composition de l’application.
- `src/data/` : données des niveaux, du clavier et d’équilibrage.
- `src/styles/` : styles de l’interface.
- `docs/adr/` : décisions d’architecture.
- `docs/specs/` : spécifications fonctionnelles.

Le Game Design Document est la source de vérité du gameplay : [docs/GDD.md](docs/GDD.md).
