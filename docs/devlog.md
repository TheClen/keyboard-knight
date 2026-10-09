# Devlog — Keyboard Knight

Journal du projet : ce que j'ai demandé à Claude, ce qui a marché, ce qui n'a pas marché,
où j'ai dû reprendre la main. Matière première pour l'étude de cas du portfolio.

## AAAA-MM-JJ — Phase 0 : cadrage
- GDD rédigé par interview avec Claude (8 questions).
- Décisions clés : …

## 2026-10-09 — Cadrage, architecture et progression
- Rédigé le [GDD](./GDD.md).
- Initialisé le projet Vite, React et TypeScript strict, avec Vitest, ESLint et Prettier.
- Ajouté les commandes de workflow `commit` et `devlog` dans `.claude/commands/`.
- Décisions d’architecture acceptées : [stack technique](./adr/0001-stack-technique.md), [reducer pur](./adr/0002-gestion-etat.md), [séparation moteur/interface](./adr/0003-separation-moteur-ui.md), [rendu DOM/CSS](./adr/0004-rendu-interface.md) et [animations CSS `steps()`](./adr/0005-animations.md).
- Aucun ajout de dépendance identifié dans les changements non committés.
- Collaboration : « Les différentes étape de création ».
- Corrections ou reprises : aucune réponse fournie.
- Retours pour la suite du workflow : aucune réponse fournie.

## 2026-10-09 — Tableau des niveaux
- Créé [docs/levels.md](./levels.md) : une ligne par niveau (1 à 12) avec lettres, doigts, monstre, boss, arme gagnée, décor et message de game over.
- Lettres et doigts repris du [GDD §4.1](./GDD.md#41-niveaux) ; monstres, armes, décors et messages proposés par Claude, validés sans retouche.
- Points ouverts du GDD §13 cochés : listes des 12 monstres et des 12 armes ; §10.4 et §10.5 renvoient au tableau.
- `docs/levels.md` ajouté aux documents de référence de [CLAUDE.md](../CLAUDE.md).
- Commit : `476ca92 docs(docs): add level table with monsters, bosses and weapons`. Aucune dépendance ajoutée.

## 2026-10-09 — Frappe d'un prompt
- Interview de feature (8 questions), puis spec [prompt-typing](./specs/prompt-typing.md).
- Décisions : chaque frappe erronée compte ; touches hors a–z ignorées par l'UI ; chrono depuis l'affichage du prompt ; tirage pondéré par `newLetterRatio` avec au moins une nouvelle lettre ; pas d'anti-répétition ; résultat minimal (`isPerfect`, `durationMs`).
- Données : `levels.json` (lettres des 12 niveaux), `keyboard-azerty.json`, `balance.json`.
- Moteur pur : `getLetterPools`, `generatePrompt` (aléatoire injecté), `createPromptState` / `typeLetter` / `getPromptResult` (horodatages injectés).
- UI : écran d'entraînement temporaire du niveau 1 (Entrée depuis le titre), filtre clavier `toGameLetter`.
- Écart au plan : instant d'affichage pris à la création du prompt (aucune animation sur cet écran) plutôt que dans un `useEffect`.
- Claude a recalculé à la main et corrigé 3 résultats attendus erronés dans ses propres tests de génération.
- 42 tests Vitest ; écran testé à la main dans le navigateur. Aucune dépendance ajoutée.
- Commits : `9aa7fa6`, `b0b5cd8`, `35c0580`, `d4c147b`.
- Collaboration : aucune réponse fournie.
- Corrections ou reprises : aucune réponse fournie.
- Retours pour la suite du workflow : aucune réponse fournie.
