# Registre de livraison — Vague 1

Statut : actif

Ce registre réserve les chemins, migrations et ordres de fusion de la première vague d’intégration du Parcours MAKOKI. Il ne prouve pas qu’une capacité utilisateur est disponible.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W1-A | Persistance MySQL du projet de vie | active | Vague 0 | `backend/src/life-project/store.js`, tests MySQL, migrations | `011_life_projects` réservée | issue #87, branche `agent/life-project-persistence-v1` |
| W1-B | API LifeProject v1 et feature flag | blocked | W1-A | routeur, capacités et raccord serveur | aucune prévue | issue #88 |
| W1-C | Triage et shell du Parcours MAKOKI | blocked | W1-B | `src/features/life-project/**`, raccord routeur dédié | aucune | issue #89 |

## Réservations centrales

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/011_life_projects.*.sql` | réservée | W1-A |
| `backend/src/life-project/store.js` | réservée | W1-A |
| `backend/test/life-project-mysql.test.js` | réservée | W1-A |
| `backend/src/server.js` | libre, intégration seulement | mainteneur / futur W1-B |
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur / futur raccord W1-C |

## Invariants W1-A

- isolation stricte par `owner_account_id` ;
- écritures multi-tables dans une transaction InnoDB ;
- historique append-only, jamais réécrit silencieusement ;
- références projet/scénario/plan garanties par clés étrangères composites ;
- sélection active garantie par une table relationnelle dédiée ;
- sérialisation compatible avec `makoki-life-project-v1` ;
- verrouillage optimiste par version de persistance ;
- migration descendante testée puis remontée avant la fin de la suite.

## Ordre immédiat

```text
W1-A persistance MySQL
→ W1-B API derrière feature flag
→ W1-C triage et shell
```

La migration `011_life_projects` est réservée après vérification de `010_profile_synthesis_snapshots` sur `main`. Aucun autre lot ne doit utiliser le numéro 011.