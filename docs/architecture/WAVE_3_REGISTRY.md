# Registre de livraison — Vague 3

Statut : actif

Ce registre coordonne le parcours adaptatif, les actions, la reprise et l’intégration finale. Il ne prouve ni validation scientifique, ni validation terrain, ni activation publique.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| V3-A | Orchestrateur adaptatif versionné | merged | #95 | `backend/src/life-project/orchestration.js`, tests, ADR | aucune | #101 |
| V3-B | Actions et progression | active | V3-A | action tracking, service, API, MySQL et tests | `012_life_project_action_tracking` réservée | issue #97, branche `agent/wave-3-action-tracking-v1` |
| V3-C | Reprise et synchronisation | blocked | V3-B | backend et `src/features/life-project/**` | à déterminer | à ouvrir |
| V3-D | Expérience adaptative intégrée | blocked | V3-A à V3-C | frontend LifeProject et raccord court | aucune prévue | à ouvrir |
| V3-E | Intégration et clôture | blocked | V3-A à V3-D | tests E2E, documentation, registre | aucune prévue | à ouvrir |

## Réservations V3-B

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/012_life_project_action_tracking.*.sql` | réservée | V3-B |
| `backend/src/life-project/action-tracking.js` | réservée | V3-B |
| `backend/src/life-project/action-tracking-store.js` | réservée | V3-B |
| `backend/src/life-project/service.js` | réservée | V3-B |
| `backend/src/life-project/router.js` | réservée | V3-B |
| `backend/src/server.js` | raccord court réservé | V3-B / mainteneur |
| `backend/package.json` | raccord test réservé | V3-B |
| `src/router/AppRouter.tsx` | libre | mainteneur |

## Invariants

- le `LifeProject` canonique n’est pas modifié par l’orchestration ;
- aucune recommandation ne calcule un métier idéal ou une probabilité de réussite ;
- chaque prochaine étape porte des raisons lisibles et des codes auditables ;
- une capacité désactivée ou indisponible n’est jamais sélectionnée ;
- les modules passés ou terminés ne sont pas reproposés silencieusement ;
- la progression est descriptive et fondée sur les actions, jamais psychologique ;
- les statuts, preuves, raisons de blocage, ordre et historique des actions sont conservés ;
- les écritures concurrentes utilisent la version canonique et `If-Match` ;
- les feature flags restent désactivés par défaut ;
- aucun contenu local non vérifié n’est introduit.

## Ordre immédiat

```text
V3-B actions et progression
→ V3-C reprise et synchronisation
→ V3-D expérience adaptative
→ V3-E clôture
```
