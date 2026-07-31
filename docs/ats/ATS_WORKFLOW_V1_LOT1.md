# ATS Workflow V1 — Lot 1

## Statut

Implémentation en branche, non activée en production.

## Livré dans la PR #185

- machine d’états fermée ;
- transitions autorisées par rôle ;
- motif obligatoire pour un rejet ;
- événements de transition immuables ;
- migration MySQL `014_ats_workflow_v1` ;
- store transactionnel avec verrou `SELECT ... FOR UPDATE` ;
- contrôle de version et rejet des écritures concurrentes ;
- contrôle d’accès par ressource : candidat propriétaire, recruteur affecté, responsable recrutement ou administrateur ;
- service ATS qui dérive l’identité et le rôle depuis la session serveur ;
- réautorisation à l’intérieur de la transaction verrouillée pour éviter une fenêtre TOCTOU ;
- routeur HTTP préparé pour détail, historique et transitions ;
- erreurs contrôlées 400/403/404/409/428 ;
- tests des contrats, du store et de l’autorisation HTTP.

## Non livré dans ce lot

- montage du routeur dans `server.js` ;
- création et publication d’offres ;
- dépôt de candidature ;
- affectation recruteur via API ;
- interfaces candidat et recruteur ;
- entretiens, notifications, statistiques et droits de données ;
- activation de `ATS_WORKFLOW_V1_ENABLED`.

## Règles

- `ATS_WORKFLOW_V1_ENABLED=false` reste la valeur par défaut ;
- `LEGACY_API_ENABLED` reste inchangé ;
- une analyse CV ne crée pas une candidature et ne décide jamais d’un recrutement ;
- aucune donnée fournie par le client ne peut choisir l’identité ou le rôle de l’acteur ;
- les permissions sont refusées par défaut et vérifiées par ressource.
