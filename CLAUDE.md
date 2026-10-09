# Keyboard Knight

Serious game web d'apprentissage de la dactylographie (AZERTY, frappe à l'aveugle).
Projet portfolio : la qualité du code ET du workflow IA sont mises en avant.

## Documents de référence
- Game Design Document : @docs/GDD.md — source de vérité pour le gameplay.
- Tableau des niveaux (lettres, monstres, boss, armes, décors) : docs/levels.md
- Décisions d'architecture : docs/adr/
- Spécifications des features : docs/specs/

## Stack (proposée, à confirmer par ADR)
- Vite + TypeScript (strict) + React
- Logique de jeu : machine à états (XState ou reducer pur)
- Animations : sprite sheets + CSS `steps()`
- Tests : Vitest (moteur), Playwright (E2E)

## Règles d'architecture
- La logique de jeu vit dans `src/engine/`, en TypeScript pur, **sans aucun import React**.
- Toute valeur d'équilibrage vit dans les données (`src/data/`), jamais en dur dans le code.
- Toute fonction du moteur est couverte par des tests Vitest.
- Le jeu est jouable à 100 % au clavier.

## Façon de travailler
- Avant d'implémenter une feature ambiguë, utilise le skill `feature-interview`.
- Propose un plan et attends ma validation avant d'écrire du code.
- Travaille par petites étapes, une feature à la fois.
- N'installe aucune dépendance sans me demander.
- Code et noms en anglais ; documentation et échanges en français.
- Commits au format Conventional Commits (`feat:`, `fix:`, `docs:`…).