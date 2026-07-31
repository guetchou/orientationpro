# Relais agent — ATS Workflow V1

## Contexte

La PR #185 contient déjà les fondations du workflow ATS V1 : machine d’états fermée, transitions par rôle, historique append-only, migration MySQL, store transactionnel, verrouillage concurrent, autorisation par ressource, service et routeur préparé.

Le travail restant doit poursuivre cette branche sans réactiver le legacy ni activer la production.

## Branche et PR

- Branche : `agent/ats-workflow-v1-foundations`
- PR : #185
- EPIC : #183
- Ne pas créer une PR concurrente tant que #185 reste ouverte.
- Conserver la PR en brouillon jusqu’à validation complète du lot.

## Objectif du prochain incrément

Rendre le backend ATS V1 testable de bout en bout en environnement isolé, derrière `ATS_WORKFLOW_V1_ENABLED=false` par défaut.

## Ordre d’exécution obligatoire

### 1. Finaliser les tests MySQL réels

Ajouter des tests exécutés avec MySQL réel couvrant :

- migration `014_ats_workflow_v1` : `up → down → up` ;
- création des tables et contraintes ;
- unicité `(job_id, candidate_account_id)` ;
- rollback atomique lorsqu’une transition échoue ;
- historique créé dans la même transaction que le changement d’état ;
- deux connexions concurrentes sur la même candidature : une seule transition réussit ;
- aucun événement parasite après conflit de version ;
- contrôle d’autorisation dans la transaction verrouillée.

Ajouter ces tests au script `test:mysql` et un script ciblé `test:ats:mysql`.

### 2. Monter les routes derrière le feature flag

Dans `server.js` :

- monter `/api/v1/ats` uniquement si `ATS_WORKFLOW_V1_ENABLED=true` ;
- exiger `AUTH_V1_ENABLED=true`, sinon échec explicite au démarrage ;
- utiliser le pool, l’authentification, le store, l’auteurisation et le service ATS V1 ;
- ne jamais dépendre de `LEGACY_API_ENABLED` ;
- ajouter les endpoints à la racine uniquement lorsque le flag est actif.

Ajouter un test prouvant que toutes les routes ATS V1 retournent `404` lorsque le flag est désactivé.

### 3. Implémenter création et publication d’offres

Routes minimales :

- `POST /api/v1/ats/jobs`
- `GET /api/v1/ats/jobs`
- `GET /api/v1/ats/jobs/:jobId`
- `POST /api/v1/ats/jobs/:jobId/publish`
- `POST /api/v1/ats/jobs/:jobId/close`

Règles :

- création réservée à `recruiter`, `recruitment_manager` ou `admin` ;
- propriétaire ou responsable habilité seulement ;
- transition fermée `draft → published → closed` ;
- publication refusée si les champs obligatoires manquent ;
- historique append-only pour création, publication et fermeture ;
- contrôle de version pour toute mutation.

### 4. Implémenter dépôt de candidature

Route minimale :

- `POST /api/v1/ats/jobs/:jobId/applications`

Règles :

- candidat authentifié uniquement ;
- offre obligatoirement publiée ;
- une candidature maximum par candidat et par offre ;
- création en état `submitted` ;
- événement initial immuable ;
- aucune analyse CV ne crée automatiquement une candidature ;
- lier explicitement une version de CV ou une pièce jointe contrôlée, jamais un chemin libre fourni par le client.

### 5. Implémenter affectation recruteur

Routes minimales :

- `POST /api/v1/ats/jobs/:jobId/recruiters`
- `DELETE /api/v1/ats/jobs/:jobId/recruiters/:accountId`

Règles :

- responsable recrutement ou administrateur seulement ;
- journaliser affectation et retrait ;
- revalider l’affectation dans la transaction avant toute transition de candidature ;
- un recruteur non affecté ne peut ni lire ni modifier les candidatures de l’offre.

### 6. Ajouter les tests API multi-comptes

Scénarios obligatoires :

1. flag désactivé → `404` ;
2. utilisateur non authentifié → `401` ;
3. candidat A crée sa candidature ;
4. candidat B ne peut pas la lire ;
5. recruteur non affecté → `403` ;
6. recruteur affecté → lecture autorisée ;
7. transition valide → état et historique mis à jour ;
8. transition interdite → `409`, aucune mutation ;
9. rejet sans motif → erreur contrôlée ;
10. rôle ou identité envoyés par le client ignorés ;
11. concurrence → une seule transition réussit ;
12. candidat ne voit pas les notes internes ;
13. recruteur d’une autre offre ne peut pas accéder à la candidature.

## Garde-fous non négociables

- `ATS_WORKFLOW_V1_ENABLED=false` dans `.env.example` et tous les environnements de production.
- Ne pas modifier `LEGACY_API_ENABLED`.
- Ne pas monter les routes legacy.
- Ne pas accepter un statut arbitraire.
- Ne pas écrire directement l’état sans événement d’historique.
- Ne pas faire confiance à `actorAccountId`, `actorRole`, `ownerAccountId` ou `candidateAccountId` fournis par le client.
- Ne pas exposer notes internes, métadonnées sensibles, contenu de CV, tokens ou secrets dans les réponses et logs.
- Ne pas déclarer l’ATS complet après ce lot.
- Ne pas fusionner tant que la CI, MySQL et les scénarios multi-comptes ne sont pas verts.

## Critères de passage en Ready for review

La PR #185 peut quitter le mode brouillon uniquement lorsque :

- les tests unitaires ATS passent ;
- les tests API ATS passent ;
- les tests MySQL ATS passent ;
- le cycle migration `up → down → up` passe ;
- le test concurrent à deux connexions passe ;
- les routes restent `404` avec le flag désactivé ;
- aucune configuration production n’active l’ATS ;
- le diff ne réactive aucun code legacy ;
- la description de PR reflète exactement ce qui a été exécuté.

## Rapport final attendu de l’agent

- fichiers modifiés ;
- machine d’états finale ;
- endpoints livrés ;
- matrice rôles/ressources ;
- migrations ;
- tests exécutés et résultats exacts ;
- limites restantes ;
- preuve que production et legacy n’ont pas été activés ;
- recommandation : fusionner, corriger ou conserver en brouillon.
