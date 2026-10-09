---
description: Propose et crée un ou plusieurs commits Conventional Commits
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(npm run lint:*), Bash(npm run typecheck:*), Bash(npm test:*)
---

## Contexte
- Statut : !`git status --short`
- Changements : !`git diff HEAD`
- Derniers commits : !`git log --oneline -10`

## Instructions
1. Lance `npm run lint`, `npm run typecheck` et `npm test`.
   Si une vérification échoue, arrête-toi et explique le problème. Ne commite jamais avec `--no-verify`.
2. Analyse les changements. S'ils couvrent plusieurs sujets indépendants,
   propose de les découper en plusieurs commits.
3. Pour chaque commit, propose :
   - les fichiers concernés,
   - un message au format Conventional Commits, en anglais :
     `type(scope): description courte à l'impératif`
     - types : feat, fix, refactor, test, docs, style, chore, perf
     - scopes : engine, ui, data, assets, config, docs
   - un corps de message si le changement le justifie (le « pourquoi », pas le « quoi »).
4. Attends ma validation avant de créer les commits.
5. Ne fais jamais de `git push`.