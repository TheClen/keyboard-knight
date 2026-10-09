# ADR 0001 — Stack technique

- **Statut :** accepté
- **Date :** 2026-10-09

## Contexte

Keyboard Knight est un jeu web desktop, développé en TypeScript, dont la logique de
jeu doit rester indépendante du framework d’interface. Le dépôt ne contient encore
aucun scaffold.

## Décision

- Vite pour le serveur de développement et le build.
- React pour composer l’interface.
- TypeScript en mode strict.
- npm pour les dépendances et le lockfile.
- Vitest pour les tests unitaires, ESLint pour l’analyse statique et Prettier pour le
  formatage.

## Conséquences

- Le développement et le build restent basés sur les outils standards de l’écosystème
  TypeScript/React.
- Le projet devra maintenir son lockfile npm.
- Les tests E2E Playwright ne sont pas ajoutés au scaffold initial ; ils seront introduits
  lorsqu’un parcours de jeu sera prêt à être testé.
