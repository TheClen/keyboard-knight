# Spec — Combat

> Statut : implémentée
> Références : [GDD §6](../GDD.md#6-système-de-combat), [spec prompt-typing](./prompt-typing.md), [ADR 0002](../adr/0002-gestion-etat.md), [ADR 0003](../adr/0003-separation-moteur-ui.md)

## Objectif

Rendre un niveau jouable de bout en bout : 9 monstres puis un boss, avec PV, dégâts, critique,
combo, bonus de vitesse et attaques des monstres au fil du temps. La logique vit dans un reducer
pur qui s'appuie sur `prompt-typing`. L'UI est un placeholder en formes colorées.

Hors périmètre : coffre, bilan, étoiles, écran de game over illustré, pause, sauvegarde, son.

## Comportement attendu

### Données

Ajouts dans `balance.json` (bloc `combat`) :

| Clé | Valeur initiale |
|---|---|
| `heroMaxHp` | 100 |
| `heroBaseDamage` | 10 |
| `perfectBonus` | 0,5 |
| `comboStepBonus` | 0,1 |
| `comboMaxBonus` | 1,0 |
| `speedBonus` | 0,1 |
| `speedBonusMsPerLetter` | 600 |
| `monstersPerLevel` | 9 |
| `monsterHp` | 25 |
| `monsterDamage` | 10 |
| `bossHpMultiplier` | 3 |
| `bossAttackIntervalMultiplier` | 1 |
| `maxTickDeltaMs` | 100 |

Ajout dans `levels.json` : `monsterAttackIntervalMs` pour chaque niveau, avec une progression
linéaire arrondie à 100 ms :
12000, 11300, 10500, 9800, 9100, 8400, 7600, 6900, 6200, 5500, 4700, 4000.

### État et actions

Le combat est un reducer pur `(state, action) => state`. Ses actions :

| Action | Émise par l'UI quand… |
|---|---|
| `tick(now)` | à chaque frame (`requestAnimationFrame`) |
| `keyPressed(letter, at)` | une lettre a–z est tapée (filtrée par `toGameLetter`) |
| `promptShown(at)` | le prompt est affiché à l'écran |
| `animationFinished(phase)` | l'animation bloquante de la sous-phase `phase` est terminée |

Le combat démarre avec `createCombatState(level, data, seed)`. Les prompts sont générés par un
générateur pseudo-aléatoire à graine, stocké dans l'état. Le reducer reste ainsi pur et
une partie est reproductible à partir de sa graine. L'UI tire la graine au lancement du combat.

### Sous-phases

```
monster-entering ─▶ prompt-pending ─▶ typing ─▶ hero-attacking ─┬─▶ prompt-pending (monstre vivant)
                                         │                       └─▶ monster-dying ─┬─▶ monster-entering (monstre suivant)
                                         │                                          └─▶ victory (boss vaincu)
                                         └─▶ hero-dying ─▶ defeat (PV du héros à 0)
```

| Sous-phase | Sortie |
|---|---|
| `monster-entering` | `animationFinished` : un prompt est généré, puis on passe à `prompt-pending`. |
| `prompt-pending` | `promptShown(at)` : la frappe démarre (`shownAt = at`). |
| `typing` | Prompt terminé : `hero-attacking`. PV du héros à 0 : `hero-dying`. |
| `hero-attacking` | `animationFinished` : `monster-dying` si les PV du monstre sont à 0, sinon nouveau prompt et `prompt-pending`. |
| `monster-dying` | `animationFinished` : `victory` après le boss, sinon monstre suivant et `monster-entering`. |
| `hero-dying` | `animationFinished` : `defeat`. |

- Un `animationFinished` dont la phase ne correspond pas à la sous-phase courante est ignoré.
- Les frappes ne sont prises en compte qu'en `typing`.

### Barre d'attaque

- Elle n'avance **qu'en `typing`**, du temps écoulé entre deux actions horodatées (`tick`, `keyPressed`, en partant de `promptShown`). Elle est en pause dans toutes les autres sous-phases.
- Chaque écart de temps est plafonné à `maxTickDeltaMs`. Si l'onglet est masqué, le jeu se fige au lieu d'enchaîner les attaques au retour.
- Quand la barre atteint l'intervalle d'attaque, le monstre frappe : le héros perd `monsterDamage` PV et la barre repart à 0.
  - L'attaque **ne bloque pas** la frappe. Un compteur d'attaques dans l'état permet à l'UI de jouer l'animation en parallèle.
- Au boss, l'intervalle est multiplié par `bossAttackIntervalMultiplier`.
- La barre repart à 0 à l'arrivée de chaque monstre. Elle est conservée d'un prompt à l'autre sur le même monstre.
- Ordre chronologique : avant d'appliquer une frappe, la barre avance jusqu'à son horodatage. En cas d'égalité, la frappe passe avant l'attaque.

### Dégâts du héros

À la fin d'un prompt, on calcule :

```
dégâts = round(heroBaseDamage × (1 + critique + combo + vitesse))
```

- critique = `perfectBonus` si le prompt est parfait, sinon 0 ;
- combo = bonus de combo courant, mis à jour par ce prompt (voir ci-dessous) ;
- vitesse = `speedBonus` si `durationMs` ≤ `speedBonusMsPerLetter` × longueur du prompt, sinon 0.

Les PV du monstre ne descendent pas sous 0 : les dégâts excédentaires sont perdus.

### Combo

- Un prompt parfait ajoute `comboStepBonus` au combo, plafonné à `comboMaxBonus`. Le prompt qui fait monter le combo en profite immédiatement : le premier prompt parfait donne +0,1.
- Une frappe erronée remet le combo à 0 **immédiatement**.
- Le combo est conservé d'un monstre à l'autre sur tout le niveau. Un coup reçu ne le remet pas à zéro.

### PV

- Le héros commence le niveau avec `heroMaxHp`. **Aucun soin** pendant le niveau.
- PV du héros à 0 : passage immédiat en `hero-dying`, même en plein prompt.
- Un monstre a `monsterHp` PV, le boss `monsterHp × bossHpMultiplier`.

### Écran de combat (UI placeholder)

- Il remplace l'écran d'entraînement : Entrée sur l'écran titre lance le combat du niveau 1.
- Le héros et le monstre sont des rectangles colorés, le boss un rectangle plus grand.
- HUD :
  - PV du héros ;
  - PV du monstre ;
  - barre d'attaque ;
  - « Monstre 3/9 » puis « BOSS » ;
  - « Combo +30 % » ;
  - prompt au-dessus du monstre, comme sur l'écran d'entraînement ;
  - après chaque prompt, les dégâts sur le monstre (« -17 »), avec « Critique ! » et « Rapide ! » si ces bonus s'appliquent. Aucune jauge de vitesse pendant la frappe : la précision prime.
- Animations CSS courtes : entrée du monstre, attaque du héros, mort du monstre, attaque du monstre (non bloquante), mort du héros.
  - La fin de chaque animation bloquante envoie `animationFinished`.
- Avec `prefers-reduced-motion`, les animations sont quasi instantanées mais émettent toujours leur fin, pour ne pas bloquer le jeu.
- `victory` affiche « Victoire ! » et `defeat` affiche le message de game over du niveau ([levels.md](../levels.md)), puis « Entrée pour recommencer ». Entrée relance un combat neuf du niveau 1.
- `src/ui/typing-test-screen.tsx` est supprimé.

## Cas limites

| Cas | Comportement |
|---|---|
| Frappe hors `typing` | Ignorée. |
| `animationFinished` d'une autre sous-phase (doublon, StrictMode) | Ignoré. |
| Écart de temps énorme (onglet masqué, machine en veille) | Plafonné à `maxTickDeltaMs` : au plus une attaque par action. |
| Prompt terminé et attaque au même horodatage | La frappe passe d'abord. Si le prompt tue le monstre, l'attaque n'a pas lieu. |
| Attaque qui met le héros à 0 en plein prompt | `hero-dying` immédiat, le prompt est abandonné. |
| Dégâts supérieurs aux PV restants du monstre | PV à 0, l'excédent est perdu. |
| Combo au maximum | Reste à `comboMaxBonus` tant qu'aucune erreur n'est commise. |
| Onglet masqué pendant un prompt | Le chrono du prompt (horloge réelle) continue : pas de bonus de vitesse probable. |

## Critères d'acceptation

### Données
- [x] `balance.json` contient le bloc `combat` avec les valeurs ci-dessus.
- [x] Chaque niveau de `levels.json` a un `monsterAttackIntervalMs` positif. Les intervalles décroissent du niveau 1 (12000) au niveau 12 (4000).
- [x] `src/engine/` ne contient aucune valeur d'équilibrage en dur.

### Moteur
- [x] Un combat démarre en `monster-entering`, avec le héros à 100 PV, le monstre 1/9 à 25 PV et le combo à 0.
- [x] Les transitions de sous-phase suivent le schéma, et un `animationFinished` d'une autre phase ne change pas l'état.
- [x] Les frappes sont ignorées hors `typing`.
- [x] Prompt imparfait et lent : 10 dégâts. Premier prompt parfait et lent : 16. Parfait et rapide : 17.
- [x] L'état expose la dernière attaque du héros : dégâts, critique (oui/non), rapide (oui/non).
- [x] Le combo augmente de 0,1 par prompt parfait, plafonne à 1,0 et retombe à 0 dès une frappe erronée.
- [x] La barre d'attaque n'avance qu'en `typing`. Elle déclenche une attaque de 10 dégâts à l'intervalle du niveau, puis repart à 0.
- [x] Un écart de temps supérieur à `maxTickDeltaMs` est plafonné.
- [x] À horodatage égal, la frappe qui termine le prompt passe avant l'attaque.
- [x] Le héros à 0 PV passe en `hero-dying`, puis en `defeat`.
- [x] Après 9 monstres vaincus, le boss arrive avec 75 PV. Sa mort mène à `victory`.
- [x] Aucun soin n'est appliqué entre les monstres.
- [x] Même graine et mêmes actions : même état final.
- [x] Le reducer ne mute pas l'état reçu.

### UI
- [x] Entrée sur le titre lance le combat du niveau 1. Le niveau peut être joué jusqu'à la victoire ou au game over, entièrement au clavier.
- [x] Le HUD affiche les PV, la barre d'attaque, « Monstre n/9 » ou « BOSS » et le combo.
- [x] Après chaque prompt, les dégâts s'affichent avec « Critique ! » et/ou « Rapide ! » quand ces bonus s'appliquent.
- [x] Une attaque du monstre n'interrompt pas la frappe.
- [ ] Avec `prefers-reduced-motion`, le combat ne se bloque pas. (non vérifié manuellement)
- [x] Entrée après la victoire ou le game over relance un combat neuf.
