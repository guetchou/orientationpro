# ADR-005 — API LifeProject v1 derrière feature flag

Statut : accepté pour W1-B

## Décision

L’API du projet de vie est exposée sous `/api/v1/life-projects` uniquement lorsque `AUTH_V1_ENABLED=true` et `LIFE_PROJECT_API_ENABLED=true`.

Elle utilise le compte authentifié comme unique propriétaire effectif. Les identifiants de projet, scénario, plan et action créés par les commandes sont générés côté serveur. Les dates et la provenance technique sont également produites côté serveur ; les champs d’identité propriétaire envoyés par un client sont ignorés.

## Endpoints

```text
GET    /api/v1/life-projects
POST   /api/v1/life-projects
GET    /api/v1/life-projects/:projectId
POST   /api/v1/life-projects/:projectId/scenarios
POST   /api/v1/life-projects/:projectId/scenarios/:scenarioId/select
POST   /api/v1/life-projects/:projectId/transitions
POST   /api/v1/life-projects/:projectId/action-plans
PUT    /api/v1/life-projects/:projectId/action-plans/:planId
```

## Concurrence

Toute mutation après création exige `If-Match: "<persistenceVersion>"` ou un champ `expectedVersion`. Les réponses portant un projet renvoient un `ETag` contenant la nouvelle version.

Une version obsolète produit `409 LIFE_PROJECT_VERSION_CONFLICT`. L’absence de version produit `428 LIFE_PROJECT_API_VERSION_REQUIRED`.

## Idempotence

Les commandes historisées — sélection de scénario et transition d’état — exigent `commandId`.

- un rejeu identique renvoie l’état courant avec `replayed: true` sans ajouter d’événement ;
- la réutilisation du même identifiant pour une commande différente produit `409 LIFE_PROJECT_COMMAND_CONFLICT`.

## Statut de capacité

Même activée techniquement, la capacité `life-project.core-v1` reste `experimental`. Cette activation ne signifie ni validation terrain, ni efficacité démontrée, ni disponibilité d’une interface utilisateur.

## Hors périmètre

- frontend et triage ;
- suppression fonctionnelle ;
- gestion de critères par endpoints dédiés ;
- stockage de justificatifs ;
- recommandations automatiques ;
- validation de faits ou de diplômes.