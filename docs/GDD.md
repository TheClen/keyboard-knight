
# Keyboard Knight — Game Design Document

> Version 1.0 — Phase 0 (cadrage)
> Statut : validé

---

## 1. Vue d'ensemble

**Keyboard Knight** est un serious game web d'apprentissage de la dactylographie (frappe à l'aveugle, 10 doigts).
Le joueur incarne un chevalier qui affronte des monstres en tapant des séquences de lettres.
Chaque niveau introduit 2 à 3 nouvelles lettres. Vaincre le boss du niveau permet de gagner une arme
et de débloquer de nouvelles lettres.

**Pitch :** apprendre à taper sans regarder son clavier, un monstre à la fois.

---

## 2. Public cible et objectifs

### Public
- Large : adolescents et adultes, débutants en frappe à l'aveugle.
- Ton : fantasy léger et humoristique.

### Double objectif
1. **Onboarding immédiat et gratifiant :** un curieux ou un recruteur doit comprendre le concept
   et réussir un premier combat en moins de 2 minutes.
2. **Apprentissage réel :** une progression pédagogique sérieuse, de la rangée de repos jusqu'aux 26 lettres.

### Principes pédagogiques
- La **précision prime sur la vitesse**.
- Le joueur garde les doigts en position tout au long de l'aventure : **aucun clavier visuel pendant le combat**.
- Apprentissage par **paires symétriques** (même doigt, une lettre par main).

---

## 3. Plateforme et contraintes techniques

| Élément | Décision |
|---|---|
| Plateforme | Navigateur desktop uniquement (clavier physique requis) |
| Mobile / tablette | Message : « Keyboard Knight nécessite un clavier physique » |
| Disposition clavier | **AZERTY uniquement** en v1, architecture data-driven (`keyboard-azerty.json`) prête pour d'autres dispositions |
| Détection | Avertissement si la disposition du joueur ne semble pas être AZERTY |
| Caractères | 26 lettres **minuscules** uniquement. Pas d'accents, majuscules ni ponctuation |
| Contrôles | **100 % clavier**, la souris n'est jamais nécessaire |
| Résolution de base | **320×180 px** (16:9), agrandie par multiple entier (×4, ×6), `image-rendering: pixelated` |
| Sauvegarde | localStorage (aucun compte, aucun backend) |

---

## 4. Progression pédagogique

### 4.1 Niveaux

| Niv. | Nouvelles lettres | Doigts concernés | Total débloqué |
|---|---|---|---|
| 1 | f j | Index (repères tactiles) | 2 |
| 2 | d k | Majeurs | 4 |
| 3 | s l | Annulaires | 6 |
| 4 | q m | Auriculaires | 8 |
| 5 | g h | Index (extension) | 10 |
| 6 | e i | Majeurs, rangée haute | 12 |
| 7 | r u | Index, rangée haute | 14 |
| 8 | t y | Index étendus, rangée haute | 16 |
| 9 | z o | Annulaires, rangée haute | 18 |
| 10 | a p | Auriculaires, rangée haute | 20 |
| 11 | c v n | Majeur gauche, index, rangée basse | 23 |
| 12 | w x b | Auriculaire, annulaire, index étendu, rangée basse | 26 |

Les niveaux 1 à 5 couvrent l'intégralité de la rangée de repos.

### 4.2 Correspondance lettres / doigts (AZERTY)

| Main | Doigt | Lettres |
|---|---|---|
| Gauche | Auriculaire | a q w |
| Gauche | Annulaire | z s x |
| Gauche | Majeur | e d c |
| Gauche | Index | r f v t g b |
| Droite | Index | y h n u j |
| Droite | Majeur | i k |
| Droite | Annulaire | o l |
| Droite | Auriculaire | p m |

Les pouces sont réservés à la barre d'espace, non utilisée en v1.
Chaque doigt a une couleur dédiée, utilisée dans l'écran tutoriel.

### 4.3 Génération des prompts
- Longueur : **6 à 8 lettres**.
- Composés **uniquement de lettres débloquées**.
- **Pondérés vers les nouvelles lettres** du niveau (valeur initiale : ~50 % de nouvelles lettres).
- Aléatoires. Pas de prompts adaptatifs aux erreurs en v1.

---

## 5. Boucle de jeu

### 5.1 Enchaînement des écrans

```
Écran titre ── Entrée ──▶ Tutoriel du niveau ── Entrée ──▶ Combat
                                                            │
                     ┌──────────────────────────────────────┘
                     ▼
        Monstres 1 à 9 ──▶ Boss ──▶ Coffre ──▶ Bilan ──┬─▶ Niveau suivant
                     │                                 └─▶ Recommencer le niveau
                     ▼
                Game over ──▶ Retour au début du niveau (monstre 1)
```

### 5.2 Description des écrans

**Écran titre**
- Titre « Keyboard Knight », invitation « Appuyez sur Entrée ».
- Possibilité d'activer le son (restrictions d'autoplay des navigateurs).
- Reprise automatique de la progression sauvegardée.

**Tutoriel du niveau**
- Clavier visuel avec les **nouvelles lettres en surbrillance** et une couleur par doigt.
- Schéma des deux mains indiquant les doigts à utiliser.
- Pas d'exercice. Entrée lance le combat.
- C'est **le seul écran** où le placement des doigts est montré.

**Combat**
- 9 monstres successifs, puis un boss.
- Voir section 6.

**Coffre**
- Animation d'ouverture du coffre.
- Révélation de l'arme gagnée (icône) et des nouvelles lettres débloquées pour le niveau suivant.

**Bilan**
- Précision (% de frappes correctes).
- Vitesse en MPM (mots par minute, convention : 1 mot = 5 caractères).
- Lettres les plus difficiles, avec le doigt correspondant.
- Note de 1 à 3 étoiles.
- Deux choix : **niveau suivant** ou **recommencer le niveau**.
- Après le dernier niveau disponible : écran « Bientôt disponible ».

**Game over**
- Message humoristique adapté au monstre (ex. : « Le rat vous a grignoté les orteils »).
- Retour au **début du niveau en cours** (monstre 1).

**Pause (Échap)**
- Reprendre, recommencer le niveau, couper/activer le son.

---

## 6. Système de combat

### 6.1 Déroulement d'un tour
1. Un prompt de 6 à 8 lettres s'affiche au-dessus du monstre.
2. **Lettre correcte :** elle s'allume en vert, le curseur avance.
3. **Lettre incorrecte :** flash rouge, le curseur **reste bloqué**, le joueur doit taper la bonne lettre.
4. **Prompt terminé :** le héros attaque (animation `attack` du héros, puis `hurt` du monstre).
5. Un nouveau prompt apparaît, jusqu'à la mort du monstre (animation `death`).
6. Le monstre suivant apparaît.

### 6.2 Dégâts du héros
- Dégâts de base fixes.
- **Prompt parfait** (aucune erreur) : coup critique ×1,5.
- **Bonus de vitesse :** petit bonus si le prompt est tapé rapidement.
- Les bonus s'additionnent : dégâts = base × (1 + critique + combo + vitesse), arrondi à l'entier.

### 6.3 Combo
- Chaque prompt parfait consécutif augmente un multiplicateur affiché.
- Une erreur remet le combo à zéro.

### 6.4 Attaques des monstres
- Chaque monstre a une **barre d'attaque** qui se remplit avec le temps.
- Barre pleine : le monstre frappe (animation `attack` du monstre, `hurt` du héros).
- Le rythme est **très lent au niveau 1** (quasiment impossible de perdre) et **accélère avec les niveaux**.
- Les erreurs de frappe n'infligent pas de dégâts directs, mais elles font perdre du temps.

### 6.5 PV du héros
- Conservés sur l'ensemble du niveau (9 monstres + boss).
- Aucun soin : les PV perdus le restent jusqu'à la fin du niveau.
- PV à 0 : animation `death`, puis game over.

### 6.6 Boss
- Version **agrandie ou recolorée** du monstre du niveau.
- Davantage de PV. Rythme d'attaque éventuellement plus rapide.

### 6.7 Valeurs initiales (à équilibrer en playtest)

| Paramètre | Valeur initiale |
|---|---|
| PV du héros | 100 |
| Dégâts de base du héros | 10 |
| Critique (prompt parfait) | ×1,5 |
| Bonus de vitesse | +10 % sous un seuil de temps par prompt |
| Combo | +0,1 par prompt parfait, plafonné à ×2 |
| PV d'un monstre | 2 à 3 prompts pour le vaincre |
| PV du boss | ×3 par rapport au monstre |
| Intervalle d'attaque des monstres | ~12 s au niveau 1, ~4 s au niveau 12 |
| Dégâts d'un monstre | 10 |

Toutes ces valeurs sont stockées dans les données (`levels.json` / config), jamais en dur dans le code.

---

## 7. Score, étoiles et sauvegarde

### 7.1 Étoiles
- Basées principalement sur la **précision**, secondairement sur la **vitesse**.
- Proposition initiale :
  - ★ : boss vaincu
  - ★★ : précision ≥ 90 %
  - ★★★ : précision ≥ 97 % et MPM ≥ seuil du niveau
- **Aucun blocage :** vaincre le boss suffit pour passer au niveau suivant.

### 7.2 Sauvegarde (localStorage)
- Niveau atteint.
- Meilleures étoiles par niveau.
- Statistiques par niveau (précision, MPM).
- Préférence de son.

---

## 8. Contrôles

| Touche | Action |
|---|---|
| Lettres | Frappe des prompts |
| Entrée | Valider / continuer (titre, tutoriel, coffre, bilan) |
| Échap | Pause |
| Touches de navigation (à préciser en spec) | Choix « niveau suivant » / « recommencer » sur le bilan |

Aucune interaction ne nécessite la souris.

---

## 9. Interface (HUD de combat)

- PV du héros.
- PV du monstre.
- Barre d'attaque du monstre.
- Compteur de progression : « Monstre 3/9 », puis « BOSS ».
- Multiplicateur de combo.
- Après chaque prompt : dégâts infligés, avec « Critique ! » (prompt parfait) et « Rapide ! » (bonus de vitesse) si obtenus.
- Icône de l'arme équipée.
- Prompt affiché au-dessus du monstre (lettres validées en vert, flash rouge en cas d'erreur).
- **Pas de clavier visuel.**

---

## 10. Direction artistique et assets

### 10.1 Style
- **Pixel art**, palette colorée, fantasy humoristique.
- Assets générés avec **PixelLab**, nettoyés et exportés en sprite sheets (Aseprite ou équivalent).
- Animations en **CSS `steps()`** sur sprite sheets.

### 10.2 Narration
- Aucune en v1.

### 10.3 Liste des assets

| Asset | Contenu | Quantité MVP (niv. 1–5) | Quantité totale |
|---|---|---|---|
| Héros | idle, attaque, touché, mort | 1 (4 animations) | 1 |
| Monstres | idle, attaque, touché, mort | 5 | 12 |
| Boss | Monstre agrandi ou recoloré | 5 (dérivés) | 12 (dérivés) |
| Coffre | Animation d'ouverture | 1 | 1 |
| Backgrounds | 1 par niveau, avec calques de **parallaxe** (nuages, etc.) | 5 | 12 |
| Icônes d'armes | Coffre et HUD | 5 | 12 |
| Éléments d'UI | Barres de PV, cadre du prompt, étoiles… | 1 set | 1 set |

### 10.4 Armes
- Un **seul sprite de héros** pour toutes les armes.
- L'arme est visible **dans le coffre** et **dans le HUD**.
- Pas d'effet d'attaque spécifique par arme.
- Liste des armes : voir [docs/levels.md](levels.md) (registre humoristique, progression du plus ridicule au plus légendaire).

### 10.5 Monstres
- Un type de monstre par niveau, avec une difficulté visuelle croissante
  (ex. : rat, gobelin, squelette… jusqu'au sorcier).
- Liste des monstres, boss et messages de game over : voir [docs/levels.md](levels.md).

---

## 11. Audio

- Effets sonores : frappe correcte, erreur, coup porté, coup reçu, mort, ouverture du coffre (générés avec jsfxr).
- Musique en boucle : optionnelle.
- Son activable dès l'écran titre, et coupable depuis la pause.

---

## 12. Scope

### Étape 0 : vertical slice (interne)
- Niveau 1 jouable de bout en bout avec des **placeholders** (formes colorées).
- Objectif : valider la boucle de jeu et l'architecture avant de produire les assets.

### MVP v1 (publié dans le portfolio) : niveaux 1 à 5
- Gameplay complet : tutoriel, combat, combo, boss, coffre, bilan, game over, pause, sauvegarde.
- Assets des niveaux 1 à 5 (voir 10.3).
- Données des **12 niveaux** déjà présentes dans `levels.json`.
- « Bientôt disponible » après le niveau 5.
- Qualité : tests Vitest (moteur), tests E2E Playwright, audit d'accessibilité, Lighthouse.
- Déploiement : Vercel ou Netlify.
- Portfolio : README, dossier `.claude/` visible, ADRs, étude de cas sur le workflow IA.

### v1.x : niveaux 6 à 12
- Ajout progressif des assets.

### Backlog (non priorisé)
- Menu de sélection des niveaux (Tab ou autre touche, attention au conflit avec la navigation native).
- Navigation dans les menus en tapant des mots avec les lettres débloquées.
- Prompts adaptatifs selon les erreurs du joueur.
- Schéma des doigts dans le menu pause.
- Armes visibles sur le sprite du héros (selon les possibilités de PixelLab).
- Narration.
- Support QWERTY et autres dispositions.
- Musique par niveau.

---

## 13. Points ouverts

À trancher pendant la phase de spécification ou de production :
- [ ] Taille des sprites (32×32 ou 48×48), à tester avec PixelLab sur une scène de 320×180.
- [x] Liste des 12 monstres.
- [x] Liste des 12 armes.
- [ ] Palette de couleurs des doigts.
- [ ] Touches de navigation sur l'écran de bilan.
- [ ] Méthode de détection de la disposition AZERTY.
- [ ] Équilibrage des valeurs de la section 6.7.
- [ ] Seuils de MPM par niveau pour la 3e étoile.