# Registre de livraison — Vague 1

Statut : actif

Ce registre réserve les chemins, migrations et ordres de fusion de la première vague d’intégration du Parcours MAKOKI. Il ne prouve pas qu’une capacité utilisateur est disponible.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W1-A | Persistance MySQL du projet de vie | merged | Vague 0 | `backend/src/life-project/store.js`, tests MySQL, migrations | `011_life_projects` fusionnée | #90 |
| W1-B | API LifeProject v1 et feature flag | active | W1-A | routeur, service, capacités et raccord serveur | aucune | issue #88, branche `agent/life-project-api-v1` |
| W1-C | Triage et shell du Parcours MAKOKI | blocked | W1-B | `src/features/life-project/**`, raccord routeur dédié | aucune | issue #89 |

## Réservations centrales

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/011_life_projects.*.sql` | fusionnée, modification par lot dédié | mainteneur |
| `backend/src/life-project/store.js` | fusionné, extension contrôlée | W1-B / mainteneur |
| `backend/src/life-project/router.js` | réservée | W1-B |
| `backend/src/life-project/service.js` | réservée | W1-B |
| `backend/src/server.js` | réservée pour raccord court | W1-B / mainteneur |
| `backend/src/capabilities/**` | réservée pour le flag LifeProject | W1-B |
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur / futur raccord W1-C |

## Invariants W1-B

- API inactive par défaut ;
- activation conditionnée par `AUTH_V1_ENABLED=true` et `LIFE_PROJECT_API_ENABLED=true` ;
- toutes les lectures et écritures utilisent le compte authentifié ;
- les identifiants, dates et provenance techniques sont contrôlés côté serveur ;
- les transitions passent par la machine à états v1 ;
- les commandes historisées exigent un identifiant stable et sont rejouables sans dupliquer un événement ;
- les mises à jour exigent une version de persistance attendue ;
- aucune interface frontend dans ce lot.

## Ordre immédiat

```text
W1-B API derrière feature flag
→ W1-C triage et shell
```

Aucune nouvelle migration n’est prévue dans W1-B.