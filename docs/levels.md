# Keyboard Knight — Tableau des niveaux

> Statut : proposition v1, à valider pendant la production des assets.
> Source de vérité pour les lettres : [GDD §4.1](GDD.md#41-niveaux).

## Règles de lecture
- L'**arme du niveau N** est gagnée en battant le boss du niveau N (coffre).
- Le **boss** est une version agrandie ou recolorée du monstre du niveau (GDD §6.6).
- Les monstres suivent une **difficulté visuelle croissante** ; les armes vont **du plus ridicule au plus légendaire**.
- Les valeurs d'équilibrage (PV, dégâts, rythme d'attaque…) ne sont **pas** ici : elles vivent dans `src/data/levels.json`.

## Tableau

| Niv. | Lettres | Doigts | Monstre | Boss | Arme gagnée | Décor | Message de game over |
|---|---|---|---|---|---|---|---|
| 1 | f j | Index (repères tactiles) | Rat | Rat-Roi | Cuillère en bois | Cave de la taverne | « Le rat vous a grignoté les orteils. » |
| 2 | d k | Majeurs | Slime | Slime royal | Baguette de pain rassis | Égouts | « Le slime vous a englué jusqu'aux oreilles. » |
| 3 | s l | Annulaires | Gobelin | Chef gobelin | Poêle à frire | Forêt | « Le gobelin vous a volé vos chaussettes… et votre dignité. » |
| 4 | q m | Auriculaires | Champignon | Champignon géant | Parapluie renforcé | Marais brumeux | « Le champignon vous a mis K.-O. d'un nuage de spores. » |
| 5 | g h | Index (extension) | Squelette | Squelette doré | Épée en bois | Cimetière | « Le squelette vous a fait tomber sur un os. » |
| 6 | e i | Majeurs, rangée haute | Chauve-souris géante | Reine des chauves-souris | Épée rouillée | Grotte de cristal | « La chauve-souris vous a pris pour un moustique. » |
| 7 | r u | Index, rangée haute | Orc | Chef de guerre orc | Hache de bûcheron | Campement orc | « L'orc vous a confondu avec son petit-déjeuner. » |
| 8 | t y | Index étendus, rangée haute | Golem de pierre | Golem de lave | Marteau de guerre | Col de montagne | « Le golem vous a aplati comme une crêpe. » |
| 9 | z o | Annulaires, rangée haute | Vampire | Comte vampire | Lance d'argent | Château en ruine | « Le vampire vous a trouvé tout à fait à son goût. » |
| 10 | a p | Auriculaires, rangée haute | Chevalier noir | Champion noir | Épée enchantée | Forteresse | « Le chevalier noir vous a renvoyé à l'entraînement. » |
| 11 | c v n | Majeur gauche, index, rangée basse | Wyverne | Wyverne ancestrale | Arc des tempêtes | Volcan | « La wyverne vous a fait griller à point. » |
| 12 | w x b | Auriculaire, annulaire, index étendu, rangée basse | Sorcier | Archimage | Clavier mécanique légendaire | Tour du sorcier | « Le sorcier vous a transformé en grenouille. » |

## Périmètre
- **Niveaux 1 à 5 : MVP v1** — assets à produire en priorité.
- **Niveaux 6 à 12 : v1.x** — assets ajoutés progressivement.
