# Spec — Frappe d'un prompt

> Statut : implémentée
> Références : [GDD §4.3](../GDD.md#43-génération-des-prompts), [§6.1](../GDD.md#61-déroulement-dun-tour), [ADR 0002](../adr/0002-gestion-etat.md), [ADR 0003](../adr/0003-separation-moteur-ui.md)

## Objectif

Poser le cœur du gameplay : générer un prompt de lettres et gérer sa saisie, lettre par lettre.
C'est la brique sur laquelle reposera le combat (dégâts, critique, combo, bonus de vitesse),
qui est **hors périmètre** ici.

La feature livre :
- les données minimales dans `src/data/` ;
- un module moteur pur dans `src/engine/`, couvert par Vitest ;
- un écran de test placeholder pour enchaîner des prompts du niveau 1 au clavier.

## Comportement attendu

### Données (`src/data/`)

| Fichier | Contenu |
|---|---|
| `levels.json` | Les 12 niveaux, avec pour chacun son numéro et ses **nouvelles lettres** (GDD §4.1). Les lettres débloquées se déduisent par cumul des niveaux précédents. |
| `keyboard-azerty.json` | Correspondance lettre → main et doigt pour les 26 lettres (GDD §4.2). |
| `balance.json` | Paramètres des prompts : `minLength` (6), `maxLength` (8), `newLetterRatio` (0,5). |

Les valeurs de combat (§6.7) seront ajoutées avec la feature combat.

### Génération d'un prompt

- La longueur est tirée uniformément entre `minLength` et `maxLength`, bornes incluses.
- Chaque lettre est tirée parmi les **nouvelles lettres** du niveau avec la probabilité `newLetterRatio`, sinon parmi les **anciennes lettres débloquées**. À l'intérieur de chaque groupe, le tirage est uniforme.
- S'il n'y a pas d'anciennes lettres (niveau 1), toutes les lettres sont tirées parmi les nouvelles.
- Si un prompt ne contient aucune nouvelle lettre, une position tirée au hasard est remplacée par une nouvelle lettre tirée au hasard.
- Aucune contrainte anti-répétition : « ffffff » est un prompt valide.
- L'aléatoire est **injecté** (fonction `() => number` dans [0, 1)), ce qui rend la génération déterministe en test.

### Saisie

- L'état d'un prompt contient : le texte, la position du curseur, le nombre d'erreurs, le résultat de la dernière frappe (correcte / erronée / aucune) et l'instant d'affichage.
- **Lettre attendue :** le curseur avance.
- **Autre lettre :** le curseur ne bouge pas et le compteur d'erreurs augmente de 1. **Chaque frappe erronée compte**, y compris quand on se trompe plusieurs fois sur la même position.
- Le moteur ne reçoit que des lettres minuscules a–z. Le filtrage des autres touches revient à l'UI.
- Quand le curseur atteint la fin du texte, le prompt est **terminé**. Les frappes suivantes sont sans effet.
- Le temps est fourni par l'appelant (horodatages en ms). Le moteur n'appelle jamais `Date.now()`.

### Résultat d'un prompt terminé

- `isPerfect` : vrai si aucune erreur.
- `durationMs` : temps écoulé entre **l'affichage du prompt** et la frappe de la dernière lettre. L'UI fournit l'instant d'affichage une fois le prompt réellement visible, c'est-à-dire après les animations.

Les statistiques détaillées (précision, erreurs par lettre) seront ajoutées avec le bilan.

### Écran de test (UI placeholder)

- On y accède avec Entrée depuis l'écran titre. Il est temporaire et sera remplacé par le combat.
- Il affiche le prompt du niveau 1 : lettres validées en vert, curseur visible sur la lettre attendue, flash rouge en cas d'erreur.
- Dès qu'un prompt est terminé, le suivant s'affiche, avec le résultat du précédent (parfait ou non, durée).
- Filtrage clavier côté UI :
  - on ignore toute touche qui n'est pas une lettre minuscule a–z (majuscules, chiffres, accents, espace, ponctuation) ;
  - on ignore les répétitions automatiques (touche maintenue) ;
  - on ignore les combinaisons avec Ctrl, Alt ou Meta, pour laisser fonctionner les raccourcis du navigateur.
- La lettre validée et la lettre attendue se distinguent par autre chose que la couleur (curseur ou soulignement).

## Cas limites

| Cas | Comportement |
|---|---|
| Niveau 1 (aucune ancienne lettre) | Toutes les lettres sont tirées parmi f et j. |
| Tirage sans aucune nouvelle lettre | Une position est remplacée par une nouvelle lettre. |
| Plusieurs erreurs sur la même position | Chacune incrémente le compteur. |
| Frappe après la fin du prompt | Ignorée : l'état est inchangé. |
| Verr. Maj activé | Les majuscules sont ignorées par l'UI. Pas d'erreur, pas d'avancée. |
| Touche maintenue | Les répétitions sont ignorées par l'UI. |
| Horodatage de frappe antérieur à l'affichage | Hors contrat : l'appelant garantit des horodatages croissants. |

## Critères d'acceptation

### Données
- [x] `levels.json` contient 12 niveaux. Les nouvelles lettres correspondent au GDD §4.1, chacune des 26 lettres apparaît exactement une fois au total.
- [x] `keyboard-azerty.json` associe chacune des 26 lettres à une main et un doigt, conformément au GDD §4.2.
- [x] Aucune valeur numérique d'équilibrage (longueurs, ratio) n'est écrite en dur dans `src/engine/`.

### Génération
- [x] Les lettres débloquées au niveau N sont l'union des nouvelles lettres des niveaux 1 à N.
- [x] Sur 1 000 prompts générés (niveaux 1 à 12), chaque longueur est comprise entre 6 et 8, et chaque prompt ne contient que des lettres débloquées et au moins une nouvelle lettre.
- [x] Au niveau 1, les prompts ne contiennent que f et j.
- [x] Avec un aléatoire injecté identique, deux générations produisent le même prompt.
- [x] Avec un aléatoire déterministe, on vérifie la répartition nouvelles/anciennes lettres selon `newLetterRatio`.

### Saisie
- [x] La bonne lettre fait avancer le curseur de 1 et marque la dernière frappe « correcte ».
- [x] Une mauvaise lettre laisse le curseur en place, ajoute 1 erreur et marque la dernière frappe « erronée ».
- [x] Trois mauvaises frappes sur la même position donnent 3 erreurs.
- [x] Le prompt est terminé quand toutes les lettres sont validées, et une frappe supplémentaire laisse l'état inchangé.
- [x] `isPerfect` vaut vrai si et seulement si le compteur d'erreurs est à 0.
- [x] `durationMs` = horodatage de la dernière lettre − instant d'affichage.
- [x] Les fonctions du moteur ne mutent pas l'état reçu.
- [x] `src/engine/` n'importe ni React ni le DOM.

### UI
- [x] Depuis l'écran titre, Entrée ouvre l'écran de test.
- [x] Taper le prompt affiché le valide lettre par lettre, puis un nouveau prompt apparaît.
- [x] Les majuscules, chiffres, touches répétées et combinaisons avec Ctrl, Alt ou Meta n'ont aucun effet.
- [x] Tout est utilisable sans souris.
