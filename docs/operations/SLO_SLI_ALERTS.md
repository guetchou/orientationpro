# SLO, SLI et alertes V5-C

Fenêtre initiale de 28 jours, à réviser après observation de préproduction.

| SLI | SLO préparatoire | Alerte | Responsable | Première action |
|---|---:|---|---|---|
| requêtes API réussies hors erreurs client | 99,5 % | < 99 % sur 15 min | exploitation | vérifier changements et dépendances |
| latence API p95 | < 750 ms | > 1 500 ms sur 10 min | backend | pool, DB, saturation |
| santé MySQL | 99,9 % | 2 échecs consécutifs | exploitation | lecture seule, diagnostic |
| conflit de version | baseline à établir | x3 baseline | produit/backend | vérifier concurrence, ne pas écraser |
| reprise échouée | < 1 % des reprises | > 3 % sur 30 min | backend | désactiver cohorte, préserver état |
| sauvegarde quotidienne vérifiée | 100 % | un échec | exploitation | relancer, escalader |
| restauration de preuve | mensuelle | échec unique | exploitation | no-go déploiement |

Les seuils sont des hypothèses opérationnelles, pas des faits d'impact. Aucune
alerte ne doit contenir une donnée personnelle ou une charge brute.
