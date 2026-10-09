# ADR 0004 — Rendu de l’interface

- **Statut :** accepté
- **Date :** 2026-10-09

## Contexte

Le GDD demande une scène 16:9 au style pixel art, mais comprend aussi des prompts,
indicateurs et écrans de menu qui doivent rester accessibles et jouables au clavier.

## Décision

Utiliser React avec des éléments DOM sémantiques et CSS plutôt qu’un canvas 2D pour le
rendu principal. Les scènes pixel art et leurs spritesheets seront intégrées dans cette
interface. Les dimensions et l’échelle pixel-perfect seront validées lors de la réalisation
de la scène de jeu.

## Conséquences

- Les prompts, menus et HUD sont exposés à l’arbre d’accessibilité et peuvent être testés
  comme interface web.
- L’interface n’est pas contrainte à un canvas opaque pour capter le clavier.
- Les performances et le comportement des animations devront être vérifiés avec les
  spritesheets réelles.
