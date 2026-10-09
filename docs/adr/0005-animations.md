# ADR 0005 — Animations pixel art

- **Statut :** accepté
- **Date :** 2026-10-09

## Contexte

Le GDD prévoit des spritesheets pixel art et des animations synchronisées avec les
actions du héros, des monstres et du coffre.

## Décision

Utiliser les spritesheets comme ressources et les animations CSS avec `steps()` pour
parcourir leurs frames. Les états du moteur déterminent les animations à afficher ; la
durée visuelle des animations ne devient pas une règle d’équilibrage.

## Conséquences

- Les animations ne nécessitent pas de moteur graphique dédié pour le périmètre v1.
- Les frames doivent être préparées avec des dimensions et un ordre cohérents.
- Une éventuelle synchronisation précise entre fin d’animation et transition de jeu devra
  être spécifiée et testée au moment de la feature concernée.
