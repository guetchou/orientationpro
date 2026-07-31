# EPIC — Workflow ATS V1

Issue de pilotage : #183.

## Objectif

Livrer un workflow de recrutement distinct du moteur d’analyse CV et du legacy désactivé, avec états fermés, transitions autorisées, permissions par ressource, historique append-only et activation contrôlée.

## Garde-fous

- `ATS_WORKFLOW_V1_ENABLED=false` par défaut.
- Aucune dépendance à `LEGACY_API_ENABLED`.
- Une analyse CV ne crée pas automatiquement une candidature et ne constitue jamais une décision de recrutement.
- Aucun statut libre fourni par le client.
- Toute transition métier produit un événement d’historique immuable.
- Autorisation refusée par défaut et vérifiée sur chaque ressource.
- Aucune activation production dans les PR d’implémentation.

## Lot 1 — fondations backend

- [x] Machine d’états et matrice de transitions.
- [x] Contrats purs et testables.
- [ ] Persistance MySQL versionnée et réversible.
- [ ] Offres, candidatures, affectations et événements.
- [ ] Routes `/api/v1/ats/*` derrière feature flag.
- [ ] Permissions candidat/recruteur/administrateur par ressource.
- [ ] Tests d’intégration MySQL et concurrence.
- [ ] Vérification 404 lorsque la capacité est désactivée.

## Critères de sortie du lot 1

Le lot 1 n’est terminé que si les migrations, routes, permissions, transitions et événements sont testés sur MySQL réel, sans activation de la capacité en production.
