# Registre de livraison — Vague 3

Statut : actif

Ce registre coordonne le parcours adaptatif, les actions, la reprise et l’intégration finale. Il ne prouve ni validation scientifique, ni validation terrain, ni activation publique.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| V3-A | Orchestrateur adaptatif versionné | merged | #95 | orchestration, tests, ADR | aucune | #101 |
| V3-B | Actions et progression | merged | V3-A | action tracking, service, API, MySQL et tests | `012_life_project_action_tracking` fusionnée | #104 |
| V3-C | Reprise et synchronisation | active | V3-B | `src/features/life-project/sync*`, hook, API et page | aucune | issue #97, branche `agent/wave-3-resume-sync-v1` |
| V3-D | Expérience adaptative intégrée | blocked | V3-A à V3-C | frontend LifeProject et raccord court | aucune prévue | à ouvrir |
| V3-E | Intégration et clôture | blocked | V3-A à V3-D | tests E2E, documentation, registre | aucune prévue | à ouvrir |

## Réservations V3-C

| Ressource | Statut | Propriétaire |
|---|---|---|
| `src/features/life-project/sync.ts` | réservée | V3-C |
| `src/features/life-project/useLifeProjectSync.ts` | réservée | V3-C |
| `src/features/life-project/api.ts` | réservée | V3-C |
| `src/features/life-project/types.ts` | réservée | V3-C |
| `src/features/life-project/LifeProjectPage.tsx` | réservée | V3-C |
| tests frontend LifeProject | réservés | V3-C |
| backend, migrations et serveur | libres, modification par lot dédié | mainteneur |
| `src/router/AppRouter.tsx` | libre | mainteneur |

## Invariants

- le projet distant est relu avant toute reprise d’écriture ;
- aucune commande locale n’est envoyée sans confirmation initiale puis confirmation de reprise ;
- un changement de version distante produit un conflit visible ;
- aucune résolution de conflit n’écrase silencieusement la version distante ;
- les commandes non appliquées restent conservées sur l’appareil ;
- la lecture hors ligne utilise un cache explicitement non canonique ;
- les identifiants de commande permettent le rejeu idempotent ;
- le mode faible bande passante utilise des commandes JSON ciblées ;
- les feature flags restent désactivés par défaut ;
- aucun contenu local non vérifié n’est introduit.

## Ordre immédiat

```text
V3-C reprise et synchronisation
→ V3-D expérience adaptative
→ V3-E clôture
```
