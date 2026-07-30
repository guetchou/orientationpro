# ATS Workflow V1 — Lot 1

## Statut

Implémentation en branche, non fusionnée, capacité désactivée par défaut.

## Livré dans cette PR

- machine d’états fermée des candidatures ;
- matrice de transitions et rôles autorisés ;
- motif obligatoire pour un rejet ;
- événements immuables de transition ;
- schéma MySQL versionné `014_ats_workflow_v1` avec rollback ;
- unicité d’une candidature par offre et candidat ;
- affectations recruteurs séparées ;
- store transactionnel avec `SELECT ... FOR UPDATE` ;
- contrôle de version pour empêcher les mises à jour perdues ;
- autorisation par ressource obligatoire et refus par défaut ;
- insertion de l’événement dans la même transaction que le changement d’état ;
- tests unitaires des contrats et du store transactionnel ;
- flag `ATS_WORKFLOW_V1_ENABLED=false` documenté.

## Non livré

- routes HTTP `/api/v1/ats` ;
- service d’autorisation concret branché aux affectations recruteurs ;
- tests MySQL réels et test de concurrence avec deux connexions ;
- création et publication des offres via API ;
- dépôt de candidature avec CV ;
- interface candidat ou recruteur ;
- entretiens, notifications et évaluations ;
- activation préproduction ou production.

## Règles de sécurité

- le legacy reste désactivé ;
- le flag ATS V1 reste faux par défaut ;
- une analyse CV ne devient jamais automatiquement une candidature ;
- aucune transition n’accepte un statut libre ;
- une mutation sans fonction d’autorisation est refusée ;
- le contenu d’un CV et les données sensibles ne sont pas placés dans les événements.

## Validation requise avant revue finale

- `npm run test:ats --prefix backend` ;
- suite backend complète ;
- migration MySQL `up → down → up` ;
- test de concurrence réel ;
- vérification des contraintes de propriété et d’affectation ;
- confirmation que les routes restent absentes tant que le lot HTTP n’est pas livré.
