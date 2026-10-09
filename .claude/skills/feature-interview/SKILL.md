---
name: feature-interview
description: À utiliser avant d'implémenter une nouvelle feature, ou quand une demande est ambiguë ou incomplète.
---

# Interview de feature

1. Relis docs/GDD.md et la spec existante dans docs/specs/ si elle existe.
2. Identifie les zones d'ombre : UX, cas limites, équilibrage, accessibilité, impact sur l'architecture.
3. Pose les questions **une par une**, en proposant à chaque fois une réponse par défaut.
4. Quand tout est clair, rédige `docs/specs/<nom-de-la-feature>.md` contenant :
   - objectif,
   - comportement attendu,
   - cas limites,
   - critères d'acceptation (testables).
5. Attends ma validation avant toute implémentation.