# ADR 0002 — Gestion de l’état du jeu

- **Statut :** accepté
- **Date :** 2026-10-09

## Contexte

Le jeu enchaîne des écrans distincts et des transitions déterministes. Le moteur doit
rester en TypeScript pur et ne pas importer React.

## Décision

Utiliser un reducer pur avec des états et actions typés pour exprimer les transitions du
jeu. Les composants React adaptent les événements d’interface aux actions du moteur et
affichent l’état résultant.

## Conséquences

- Les transitions sont testables sans DOM ni runtime React.
- Aucun paquet de machine à états n’est requis.
- La structure du reducer sera introduite avec la première feature de gameplay, plutôt
  que de préimplémenter des transitions non spécifiées.
