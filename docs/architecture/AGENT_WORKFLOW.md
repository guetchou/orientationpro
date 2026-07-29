# Travail multi-agents — MAKOKI

Statut : règle de contribution de la Vague 0

Références : `MAKOKI_LIFE_PATH_ENGINE.md`, `MAKOKI_AS_IS_AUDIT.md`, issue #75.

## 1. Principe

Chaque agent livre une tranche verticale indépendante par issue, branche et pull request. Le dépôt reste un monolithe modulaire ; les agents se répartissent les frontières de domaine, pas des microservices artificiels.

Une tâche autorisée est menée de bout en bout :

```text
cadrage
-> inspection
-> branche
-> implémentation
-> tests
-> corrections
-> commit
-> push
-> PR
-> CI
-> revue finale
-> fusion lorsque autorisée
-> rapport consolidé
```

## 2. Contrat obligatoire d’un lot

Avant toute modification, l’issue précise :

- l’objectif observable ;
- les faits disponibles ;
- les hypothèses et inconnues ;
- les invariants ;
- les dépendances ;
- les chemins réservés ;
- les migrations éventuelles ;
- les tests attendus ;
- les risques ;
- le hors périmètre ;
- l’ordre de fusion.

Une page existante, un code compilable ou une CI verte ne prouvent pas la validité scientifique, réglementaire, métier ou terrain d’une capacité.

## 3. Nommage

Branches recommandées :

```text
agent/<domaine>-<lot>-v1
feat/<domaine>-<lot>
fix/<domaine>-<incident>
docs/<domaine>-<sujet>
```

Les contrats et moteurs portent une version explicite lorsque leurs résultats doivent rester relisibles : `life-project-v1`, `profile-synthesis-v1`, etc.

## 4. Réservation des chemins

Un lot réserve ses chemins dans le registre de vague avant implémentation. Deux PR actives ne modifient pas simultanément le même contrat ou fichier central.

Points d’intégration réservés à une PR dédiée :

- `src/router/AppRouter.tsx` ;
- `backend/src/server.js` ;
- `.github/workflows/**` ;
- `backend/migrations/**` ;
- contrats transversaux du projet de vie ;
- registres de capacités et permissions.

Un agent qui a besoin d’un point d’intégration prépare son module dans son propre répertoire puis déclare la dépendance envers la PR d’intégration.

## 5. Migrations

Le répertoire canonique est `backend/migrations/`.

Règles :

1. réserver le prochain numéro dans le registre avant de créer les fichiers ;
2. fournir ensemble `<numéro>_<nom>.up.sql` et `<numéro>_<nom>.down.sql` ;
3. ne jamais renuméroter une migration déjà fusionnée ;
4. tester montée, rollback et réapplication ;
5. mettre à jour les fixtures qui vérifient le cycle complet ;
6. ne pas partager une migration entre plusieurs PR fonctionnelles indépendantes ;
7. conserver les données historiques sauf décision explicite et testée.

## 6. PR empilées

Une PR dépendante reste en brouillon et annonce en tête :

```text
Depends on #<PR>
Base temporaire : <branche>
Ordre de fusion : #A -> #B
```

Après fusion de la dépendance, la PR est recréée ou retargetée proprement sur `main`. Son diff final ne doit pas réintroduire les commits de la PR parente.

## 7. Garde de fusion

Une PR n’est fusionnable que si :

- son diff correspond à l’issue ;
- les contrats et migrations sont documentés ;
- les tests applicables ont réellement été exécutés ;
- la CI, le build, les parcours authentifiés et les preflights applicables sont verts ;
- les commentaires de revue sont résolus ;
- les limites sont visibles lorsque le produit pourrait induire en erreur ;
- les snapshots historiques restent relisibles ;
- la branche est compatible avec `main` ;
- aucune hypothèse n’est présentée comme un fait.

Une panne CI indépendante est diagnostiquée et corrigée dans une PR atomique ; elle n’est ni masquée ni contournée.

## 8. Responsabilités des agents

L’agent auteur :

- inspecte le code avant de proposer une architecture locale ;
- ne duplique pas un moteur ou un contrat existant ;
- écrit les tests du comportement livré ;
- documente les limites et données manquantes ;
- corrige les échecs jusqu’à obtention des preuves prévues ;
- ne fusionne pas une PR hors de l’autorisation donnée.

L’agent d’intégration :

- contrôle les collisions de chemins et migrations ;
- raccorde les modules au routeur, au serveur ou à la CI ;
- vérifie la compatibilité entre contrats ;
- arbitre l’ordre de fusion ;
- produit le rapport consolidé.

## 9. État des preuves

Les rapports distinguent obligatoirement :

- conçu ;
- implémenté ;
- exécuté ;
- testé ;
- validé techniquement ;
- validé scientifiquement ou terrain ;
- non vérifié.

Aucune de ces catégories ne doit être déduite silencieusement d’une autre.

## 10. Rapport consolidé

À la fin d’un lot, le rapport contient :

- issue, branche, commit et PR ;
- fichiers et contrats modifiés ;
- tests réellement exécutés ;
- résultats CI ;
- corrections effectuées ;
- décision de fusion ;
- risques résiduels ;
- niveau de confiance ;
- prochaine dépendance débloquée.
