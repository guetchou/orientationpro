# Audit `as-is` — architecture actuelle de MAKOKI

Statut : audit initial basé sur les éléments observables du dépôt

Issue : #69

Dépendance : PR #67

## 1. Objet et méthode

Cet audit décrit l’architecture actuellement observable avant la création des contrats et modules du Parcours MAKOKI. Il sépare :

- les faits directement observés dans les fichiers, routes et scripts ;
- les déductions architecturales ;
- les inconnues qui exigent une inspection ou une décision supplémentaire.

Il ne constitue pas une validation fonctionnelle, scientifique, réglementaire ou de production.

Le niveau C4 retenu est volontairement limité au contexte et aux conteneurs : ces deux niveaux suffisent généralement pour communiquer l’architecture d’une équipe, tandis que les diagrammes de code détaillés vieillissent rapidement.

## 2. Faits vérifiés

### 2.1 Dépôt et pile principale

Le dépôt est une application web privée, avec :

- frontend React 18, TypeScript et Vite ;
- routage React Router ;
- API Node.js et Express ;
- MySQL comme persistance canonique des nouveaux parcours ;
- migrations versionnées ;
- CI GitHub Actions ;
- build PWA ;
- déploiement Docker/VPS documenté.

Le README interdit l’ajout de nouvelles dépendances Supabase dans les nouveaux parcours, mais des paquets et usages Supabase historiques restent présents côté frontend.

### 2.2 Conteneurs déployables observables

```text
Navigateur / PWA React
        |
        | HTTPS / JSON
        v
API Express unique
        |
        +--> MySQL 8
        +--> stockage de fichiers CV selon configuration
        +--> fournisseurs d'identité et messagerie selon configuration
        +--> imports locaux ESCO / O*NET
```

Il n’existe pas, dans la structure canonique observée, de microservices métiers autonomes. Les modules Auth V1, profil, orientation, carrière et CV sont montés dans le même processus Express.

### 2.3 Frontend actuel

`src/App.tsx` compose notamment :

- `QueryClientProvider` ;
- `AuthProvider` ;
- gestion du mode démo ;
- bannière hors ligne ;
- suivi des métriques web ;
- routeur central.

`src/router/AppRouter.tsx` contient un routeur central avec chargement différé des pages. Les routes visibles montrent deux modèles concurrents :

1. parcours canoniques récents protégés : profil, RIASEC, résultats, recommandations métiers, catalogue carrière, CV ;
2. pages historiques ou spécialisées directement exposées : tests émotionnel, apprentissage, intelligences multiples, reconversion, sans diplôme, emploi senior, entrepreneuriat, ATS, recrutement, emplois et divers tableaux de bord.

Le site reste donc organisé publiquement comme un catalogue de pages et de tests, alors que les briques canoniques récentes commencent à former un parcours cohérent.

### 2.4 Backend actuel

`backend/src/server.js` monte les groupes suivants :

#### Frontière canonique versionnée

- `/api/v1/auth` ;
- `/api/v1/profile` ;
- `/api/v1/profile/syntheses` ;
- `/api/v1/orientation` ;
- `/api/v1/career` ;
- `/api/v1/cv`.

Ces modules utilisent Auth V1, le pool MySQL partagé et, selon le domaine, les permissions.

#### Frontières historiques

- `/api/auth` derrière `LEGACY_AUTH_ENABLED` ;
- `/api/cv` ;
- `/api/candidates` ;
- `/api/jobs` ;
- `/api/ats` ;
- `/api/appointments` ;
- `/api/messaging` ;
- `/api/applications` ;
- `/api/matching` ;
- `/api/communication` ;
- routes de scraping sous `/api`.

Le serveur contient donc un monolithe modulaire émergent, mais aussi un ensemble de routes historiques directement montées autour de modules non alignés sur la frontière `/api/v1`.

### 2.5 Modules canoniques déjà stabilisés

Les PR fusionnées et les tests observables établissent l’existence de :

- Auth V1 avec sessions révocables ;
- profil adaptatif et historique d’études ;
- compétences confirmées reliées à ESCO ;
- hypothèses de profil confirmées ou rejetées humainement ;
- instrument RIASEC v2 versionné au statut `draft` ;
- moteur RIASEC serveur unique ;
- recommandations métiers contextualisées et explicables ;
- snapshots immuables des recommandations ;
- synthèses de profil versionnées et immuables ;
- analyse CV V1.

Ces briques doivent être orchestrées, pas réécrites.

### 2.6 Tests et CI

Les scripts racine exécutent :

- contrôle des fichiers sensibles ;
- TypeScript ;
- lints frontend et backend ;
- tests frontend ;
- tests backend ;
- build Vite/PWA.

Le backend sépare notamment :

- tests unitaires/API ;
- tests MySQL séquentiels ;
- tests carrière ;
- tests CV ;
- tests profil.

La CI actuelle possède deux jobs principaux :

1. qualité web, build et smoke navigateur ;
2. backend, MySQL et parcours authentifiés.

## 3. Diagramme C4 — contexte actuel

```text
[Jeune / étudiant / demandeur d'emploi / salarié]
                    |
                    v
              [MAKOKI Web]
                    |
                    +---- [Conseillers / RH / recruteurs / administrateurs]
                    |
                    +---- [Référentiels ESCO et O*NET importés]
                    |
                    +---- [Fournisseurs e-mail / OAuth configurés]
                    |
                    +---- [Sites d'offres ou sources de scraping historiques]
```

### Interprétation

Le système sert déjà plusieurs rôles, mais les expériences sont distribuées entre pages publiques, tableaux de bord spécialisés et modules récents. Le projet de vie n’est pas encore une entité ou un parcours transversal observable.

## 4. Diagramme C4 — conteneurs actuels

```text
[React/Vite PWA]
  - pages publiques
  - Auth V1 côté navigateur
  - profil
  - RIASEC
  - carrière
  - CV
  - tests historiques
  - tableaux de bord par rôle
          |
          v
[Express API unique]
  - auth-v1
  - profile
  - orientation/riasec
  - career
  - cv
  - routes legacy
          |
          v
[MySQL]
  - comptes et sessions
  - profils et études
  - compétences et hypothèses
  - instruments, tentatives et résultats
  - catalogues ESCO/O*NET
  - recommandations et snapshots
  - analyses CV
```

## 5. Matrice de domaines observable

| Domaine | Frontend principal | Backend canonique | État architectural |
|---|---|---|---|
| Identité | hooks/pages auth | `backend/src/auth-v1` | canonique, legacy encore présent |
| Profil | `Profile` | `backend/src/profile` | canonique et versionné |
| Orientation RIASEC | pages RIASEC | `backend/src/orientation/riasec` | canonique, instrument encore `draft` |
| Carrière | pages carrière | `backend/src/career` | canonique, ESCO/O*NET |
| CV | optimiseur/historique | `backend/src/cv` | V1 canonique + route historique |
| Emploi/ATS | plusieurs pages | routes historiques | frontière non stabilisée |
| Tests spécialisés | pages `/tests/*` | moteurs dispersés ou navigateur | à auditer avant réutilisation |
| Conseillers/RH/recruteurs | tableaux de bord | routes historiques | à rattacher aux délégations futures |
| Projet de vie | absent comme domaine explicite | absent | nouveau noyau requis |
| Éducation internationale | contenus ponctuels/post-bac | absent comme catalogue vérifié | nouveau domaine requis |
| Entrepreneuriat/AGR | test/page | absent comme parcours longitudinal | nouveau domaine requis |
| Bien-être/accompagnement | test émotionnel et rendez-vous | routes dispersées | garde-fous et escalade à définir |

## 6. Écart vers l’architecture cible

### À conserver

- Auth V1 et isolation par compte ;
- MySQL et migrations additives pour la première phase ;
- moteurs déterministes et versionnés ;
- faits/hypothèses distincts ;
- ESCO/O*NET comme référentiels internationaux ;
- snapshots append-only ;
- CI à deux jobs principaux ;
- PWA, reprise et conception mobile.

### À introduire

- domaine `life-project` ;
- machine à états du parcours ;
- scénarios, critères de décision, plans et jalons ;
- triage unique en façade ;
- orchestration des modules existants ;
- provenance générique `Fact/Hypothesis/Evidence` ;
- éducation locale/internationale vérifiée ;
- délégations parent/conseiller ;
- accompagnement et suivi longitudinal.

### À contenir puis retirer progressivement

- catalogue frontal de tests comme porte d’entrée principale ;
- routes non versionnées concurrentes ;
- Auth legacy ;
- dépendances Supabase résiduelles ;
- moteurs exécutés uniquement dans le navigateur ;
- rôles et tableaux de bord non reliés à une délégation canonique ;
- affirmations ou données non sourcées dans les modules historiques.

## 7. Risques de parallélisation

### Risque 1 — fichiers centraux

`src/router/AppRouter.tsx`, `backend/src/server.js`, les scripts de migration et les workflows CI sont des points de conflit élevés. Ils doivent être modifiés uniquement par des PR d’intégration ou après réservation explicite.

### Risque 2 — migrations concurrentes

Plusieurs agents ne doivent pas choisir indépendamment le même numéro de migration. Une issue d’intégration doit réserver les numéros et l’ordre de fusion.

### Risque 3 — contrats dupliqués

Les types `LifeProject`, `Scenario`, `ActionPlan`, `Fact`, `Hypothesis` et `Evidence` doivent être figés avant les interfaces qui les consomment.

### Risque 4 — legacy présenté comme canonique

Une page existante ne prouve pas qu’un moteur est valide, versionné, persistant ou sécurisé. Chaque test historique doit être classé : conserver, encapsuler, réécrire ou retirer.

### Risque 5 — documentation en avance sur le produit

Le terme « accompagnement » ne doit pas être affiché comme capacité complète tant que suivi, plan d’action, délégation ou intervention humaine ne sont pas effectivement livrés.

## 8. Chemins proposés pour la propriété initiale

```text
/docs/architecture/**                  -> architecture et contrats
/backend/src/life-project/**           -> projet de vie
/backend/src/profile/**                -> profil, faits et hypothèses
/backend/src/orientation/**            -> instruments et évaluations
/backend/src/career/**                 -> métiers et compétences
/backend/src/education/**              -> programmes et mobilité
/backend/src/employment/**             -> emploi et candidatures
/backend/src/entrepreneurship/**       -> entrepreneuriat et AGR
/backend/src/guidance/**               -> accompagnement et délégations
/src/features/life-project/**          -> expérience Parcours MAKOKI
/src/features/profile/**               -> profil
/src/features/orientation/**           -> évaluations
/src/features/education/**             -> études et mobilité
/.github/workflows/**                  -> CI et déploiement, intégration seulement
/backend/**/migrations/**               -> réservation obligatoire
```

Les chemins cibles n’existent pas tous encore. Leur création doit suivre les contrats de la Vague 0.

## 9. Ordre de travail recommandé

1. fusionner ou corriger la PR d’architecture #67 ;
2. valider le présent audit ;
3. créer une PR de gouvernance : template PR, CODEOWNERS et registre des lots ;
4. figer les contrats partagés ;
5. créer le domaine `life-project` sans UI complète ;
6. créer le shell du parcours derrière un feature flag ;
7. connecter profil, RIASEC, carrière et synthèse ;
8. seulement ensuite paralléliser éducation, emploi, entrepreneuriat et accompagnement.

## 10. Incident CI observé

La première exécution CI de la PR #67 a échoué dans le smoke navigateur parce que la navigation vers `/` a renvoyé HTTP `304`. Le build, les tests frontend, le backend et MySQL étaient verts. Le smoke exige actuellement strictement `200` pour chaque navigation, alors qu’une réponse conditionnelle `304` peut être provoquée par le cache du navigateur.

Ce point est indépendant du contenu documentaire, mais doit être corrigé ou stabilisé avant fusion afin de ne pas banaliser une CI rouge.

## 11. Inconnues restantes

- liste exhaustive et emplacement exact des migrations ;
- tables encore utilisées par les routes historiques ;
- dépendances réelles des tableaux de bord spécialisés ;
- couverture de production des feature flags ;
- statut de toutes les données d’emploi et de scraping ;
- usage résiduel réel de Supabase ;
- stratégie de stockage des pièces justificatives ;
- capacité actuelle de reprise hors ligne au-delà de l’interface ;
- règles de protection de branche et CODEOWNERS actives dans GitHub.

## 12. Conclusion

Le dépôt possède déjà un noyau moderne cohérent : Auth V1, profil, RIASEC, ESCO/O*NET, recommandations, snapshots et synthèse. Le problème principal n’est pas l’absence totale de fondations, mais la coexistence de ce noyau avec une surface historique dispersée.

La trajectoire la plus sûre est donc :

```text
stabiliser les contrats
-> créer le domaine projet de vie
-> orchestrer les briques canoniques
-> contenir le legacy
-> ajouter les nouveaux domaines
-> valider scientifiquement et sur le terrain
```
