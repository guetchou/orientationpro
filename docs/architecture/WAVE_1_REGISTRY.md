# Registre de livraison — Vague 1

Statut : actif

Ce registre réserve les chemins, migrations et ordres de fusion de la première vague d’intégration du Parcours MAKOKI. Il ne prouve pas qu’une capacité utilisateur est disponible.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W1-A | Persistance MySQL du projet de vie | merged | Vague 0 | `backend/src/life-project/store.js`, tests MySQL, migrations | `011_life_projects` fusionnée | #90 |
| W1-B | API LifeProject v1 et feature flag | merged | W1-A | routeur, service, capacités et raccord serveur | aucune | #91 |
| W1-C | Triage et shell du Parcours MAKOKI | active | W1-B | `src/features/life-project/**`, raccord routeur dédié | aucune | issue #89, branche `agent/life-project-shell-v1` |

## Réservations centrales

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/011_life_projects.*.sql` | fusionnée, modification par lot dédié | mainteneur |
| `backend/src/life-project/store.js` | fusionné, extension contrôlée | mainteneur |
| `backend/src/life-project/router.js` | fusionné, extension contrôlée | mainteneur |
| `backend/src/life-project/service.js` | fusionné, extension contrôlée | mainteneur |
| `backend/src/server.js` | fusionné, raccord contrôlé | mainteneur |
| `backend/src/capabilities/**` | fusionné, extension contrôlée | mainteneur |
| `src/features/life-project/**` | réservée | W1-C, branche `agent/life-project-shell-v1` |
| `src/router/AppRouter.tsx` | réservé à la PR d’intégration courte | W1-C / mainteneur |

## Invariants W1-C

- interface inactive par défaut ;
- activation conditionnée par `VITE_LIFE_PROJECT_ENABLED=true` et la capacité serveur `life-project.core-v1` ;
- création et reprise utilisent exclusivement l’API Auth V1 ;
- les informations déclarées restent explicitement distinguées des faits confirmés ;
- aucune promesse d’emploi, d’admission ou de réussite ;
- les routes historiques ne sont pas supprimées ;
- aucune modification des migrations ni des contrats backend.

## Ordre immédiat

```text
W1-C shell et triage
→ courte PR de raccord du routeur
→ recette navigateur authentifiée
```

La capacité reste invisible tant que les flags frontend et backend ne sont pas tous deux activés.
