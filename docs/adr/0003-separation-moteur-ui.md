# ADR 0003 — Séparation du moteur et de l’interface

- **Statut :** accepté
- **Date :** 2026-10-09

## Contexte

Le gameplay doit pouvoir être testé isolément et toutes les valeurs d’équilibrage doivent
provenir de données, conformément au GDD et aux règles du projet.

## Décision

- Placer règles, types et transitions de jeu dans `src/engine/`, en TypeScript pur et sans
  import React.
- Placer niveaux, disposition clavier et équilibrage dans `src/data/`.
- Placer composants et écrans dans `src/ui/`, composés par `src/app/`.
- Garder les dépendances orientées vers le moteur : l’interface peut appeler le moteur,
  jamais l’inverse.

## Conséquences

- Les tests moteur s’exécutent en environnement Node, sans DOM.
- Les valeurs d’équilibrage peuvent évoluer dans les données sans modifier les règles.
- Les adaptations clavier et rendu restent dans les couches d’interface.
