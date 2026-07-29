# Registre de livraison — Vague 1

Statut : actif

Ce registre réserve les chemins, migrations et ordres de fusion de la première vague d’intégration du Parcours MAKOKI. Il ne prouve pas qu’une capacité utilisateur est disponible.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W1-A | Persistance MySQL du projet de vie | merged | Vague 0 | `backend/src/life-project/store.js`, tests MySQL, migrations | `011_life_projects` fusionnée | #90 |
| W1-B | API LifeProject v1 et feature flag | merged | W1-A | routeur, service, capacités et raccord serveur | aucune | #91 |
| W1-C | Triage et shell du Parcours MAKOKI | active | W1-B | `src/features/life-project/**`, page, dashboard et raccord routeur | aucune | issue #89, branche `agent/life-project-triage-shell-v1` |

## Réservations centrales

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/011_life_projects.*.sql` | fusionnée, modification par lot dédié | mainteneur |
| `backend/src/life-project/**` | fusionné, extension par lot dédié | mainteneur |
| `backend/src/server.js` | libre, intégration seulement | mainteneur |
| `backend/src/capabilities/**` | fusionné, modification par lot dédié | mainteneur |
| `src/features/life-project/**` | réservée | W1-C |
| `src/router/AppRouter.tsx` | réservée pour raccord court | W1-C / mainteneur |
| `src/pages/Dashboard.tsx` | réservée pour point d’entrée | W1-C |

## Invariants W1-C

- l’API et la capacité sont vérifiées avant tout appel au projet de vie ;
- l’expérience commence par la situation et le besoin, pas par le choix d’un test ;
- le triage reste court, compréhensible et révisable ;
- le brouillon est conservé localement jusqu’à création réussie ;
- le dernier projet lisible est mis en cache pour consultation hors ligne ;
- aucune déclaration n’est présentée comme un fait vérifié ;
- les tests historiques ne sont pas supprimés ;
- aucune promesse d’emploi, d’admission ou de réussite ;
- navigation clavier, mobile et états chargement/hors ligne/erreur couverts.

## Ordre immédiat

```text
W1-C triage et shell
→ clôture de la Vague 1
```

Aucune migration ou modification backend n’est prévue dans W1-C.