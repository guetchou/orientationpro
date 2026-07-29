# Architecture cible — MAKOKI Life-Path Engine

Statut : proposition initiale à valider

Issue de référence : #66

## 1. Décision structurante

MAKOKI présente **un seul parcours utilisateur** pour construire et faire évoluer un projet de vie. Ce parcours orchestre plusieurs modules spécialisés, indépendants et versionnés. Il ne fusionne pas tous les construits dans un score psychologique universel.

La plateforme couvre progressivement :

- scolarité et choix de filière ;
- études courtes, longues et supérieures ;
- formations et passerelles ;
- compétences, diplômes et acquis d’expérience ;
- métiers et vie professionnelle ;
- recherche d’emploi ;
- reconversion ;
- entrepreneuriat et activités génératrices de revenus ;
- savoir-être, savoir-vivre et compétences transversales ;
- bien-être lié au parcours ;
- mobilité académique locale, régionale, internationale et à distance.

## 2. Principes non négociables

1. Une information déclarée reste déclarée tant qu’elle n’est pas vérifiée.
2. Une hypothèse générée n’est jamais confirmée automatiquement.
3. Un score est rattaché à un instrument, une version, une méthode et des limites.
4. Une recommandation expose ses signaux, données manquantes, contraintes et incertitudes.
5. Une validation technique ne vaut pas validation scientifique, réglementaire ou terrain.
6. Aucun LLM ne calcule seul les scores, équivalences, admissibilités ou reconnaissances.
7. Les résultats historiques sont figés par snapshots append-only.
8. Le changement de direction fait partie du parcours ; il n’est pas traité comme un échec.
9. L’expérience doit rester utilisable sur mobile, réseau instable et sessions interrompues.
10. `main` reste continuellement livrable ; chaque changement passe par une PR courte et testée.

## 3. Modèle fonctionnel

Le Parcours MAKOKI suit une machine à états explicite :

```text
ACCUEIL
  -> TRIAGE
  -> EXPLORATION
  -> CLARIFICATION
  -> COMPARAISON
  -> CHOIX_PROVISOIRE
  -> PREPARATION
  -> EXPERIMENTATION
  -> ACTION
  -> SUIVI
  -> CONFIRMATION | REORIENTATION
```

Chaque état possède :

- des objectifs ;
- des données minimales ;
- des actions autorisées ;
- des critères de sortie ;
- des événements historisés ;
- des garde-fous de sécurité et d’âge.

## 4. Contexte C4 — niveau système

### Acteurs

- utilisateur accompagné ;
- parent ou représentant légal ;
- conseiller, enseignant ou coach ;
- établissement scolaire ou universitaire ;
- employeur ou service RH ;
- organisme d’emploi ou institution publique ;
- administrateur de référentiels ;
- chercheur/psychométricien autorisé.

### Systèmes externes

- ESCO ;
- O*NET ;
- référentiels ISCED/CITE ;
- autorités nationales d’accréditation et de reconnaissance ;
- catalogues d’établissements et programmes vérifiés ;
- services de messagerie et notifications ;
- éventuels partenaires d’accompagnement humain.

## 5. Conteneurs logiques cibles

L’architecture reste d’abord un **modular monolith** afin de conserver des transactions simples, une exploitation maîtrisée et des PR verticales. Les frontières sont conçues pour permettre une extraction ultérieure si les mesures de charge ou d’organisation le justifient.

```text
Web/PWA
  -> API Auth V1
  -> Orchestrateur de parcours
       -> Profil et faits confirmés
       -> Instruments et évaluations
       -> Projet de vie
       -> Carrière et compétences
       -> Éducation et mobilité
       -> Emploi et candidature
       -> Entrepreneuriat
       -> Accompagnement et suivi
       -> Explicabilité et snapshots
  -> PostgreSQL/MySQL actuel selon trajectoire de migration décidée
  -> Catalogue/graphe de connaissances
  -> Workers d’import et de validation
```

Aucun microservice n’est créé uniquement pour répartir le travail entre agents. Le découpage des PR suit les frontières de domaine, pas une multiplication prématurée des déploiements.

## 6. Domaines et responsabilités

### 6.1 Identité et consentement

Responsabilités :

- compte, sessions et permissions ;
- âge et représentation légale ;
- consentements versionnés ;
- délégations parent/conseiller ;
- export, suppression et traçabilité.

### 6.2 Profil factuel

Responsabilités :

- situation actuelle ;
- historique scolaire et professionnel ;
- diplômes et justificatifs ;
- compétences déclarées, observées ou importées ;
- contraintes, ressources et mobilité ;
- distinction stricte fait/hypothèse.

### 6.3 Instruments et évaluations

Responsabilités :

- registre d’instruments ;
- banques d’items versionnées ;
- règles d’éligibilité par âge et contexte ;
- tentatives reprenables ;
- moteurs de score déterministes ;
- preuves de validité, fidélité, équité et statut `draft/pilot/validated/retired` ;
- futur CAT/IRT uniquement après calibration suffisante.

RIASEC constitue un module d’intérêts. VAKOG/PNL ne sont pas des fondements scientifiques du moteur. Les préférences de présentation peuvent être enregistrées sans conclure à un canal d’apprentissage fixe.

### 6.4 Projet de vie

Responsabilités :

- objectifs et horizons ;
- scénarios alternatifs ;
- critères de décision personnels ;
- choix provisoires ;
- plans d’action ;
- jalons, obstacles et révisions ;
- historique longitudinal.

### 6.5 Carrière et compétences

Responsabilités :

- métiers, activités, compétences, connaissances et conditions de travail ;
- relations ESCO/O*NET versionnées ;
- rapprochement explicable ;
- écarts de compétences ;
- passerelles entre métiers ;
- couche locale distincte des référentiels internationaux.

### 6.6 Éducation et mobilité internationale

Responsabilités :

- systèmes éducatifs et niveaux ISCED ;
- programmes, établissements, diplômes et prérequis ;
- parcours locaux, étrangers, hybrides et à distance ;
- langues, calendriers et coûts sourcés ;
- statut d’accréditation ;
- reconnaissance académique et professionnelle ;
- professions réglementées ;
- provenance, date de vérification et incertitude.

Une correspondance ISCED n’est jamais présentée comme une équivalence juridique automatique.

### 6.7 Emploi et candidature

Responsabilités :

- préparation CV et lettre ;
- candidatures et relances ;
- préparation entretien ;
- compétences à démontrer ;
- suivi des démarches ;
- protection contre les offres frauduleuses.

### 6.8 Entrepreneuriat et AGR

Responsabilités :

- problème observé et bénéficiaire/client ;
- ressources disponibles ;
- hypothèses de valeur ;
- expérimentation à faible coût ;
- compétences entrepreneuriales à développer ;
- plan simple et suivi ;
- distinction entre désir d’entreprendre et faisabilité démontrée.

### 6.9 Bien-être et accompagnement

Responsabilités :

- difficultés liées au parcours ;
- motivation, stress, isolement et sentiment d’efficacité ;
- écoute et orientation vers un humain ;
- protocoles d’escalade ;
- interdiction de diagnostic clinique automatisé hors dispositif qualifié.

## 7. Modèle de données conceptuel

Entités principales :

```text
Account
PersonProfile
Consent
Delegation
ConfirmedFact
Hypothesis
Evidence
Instrument
InstrumentVersion
Item
AssessmentAttempt
AssessmentResult
LifeProject
LifeProjectScenario
DecisionCriterion
ActionPlan
ActionItem
Milestone
Barrier
Support
Skill
Occupation
EducationSystem
Institution
Programme
Qualification
RecognitionRule
RegulatedProfession
Opportunity
GuidanceInteraction
RecommendationSnapshot
AuditEvent
```

Tous les objets décisionnels critiques portent au minimum :

- `id` stable ;
- propriétaire ;
- version du schéma ;
- source/provenance ;
- date d’observation ou de vérification ;
- statut de confirmation ;
- niveau d’incertitude lorsque pertinent ;
- politique de conservation ;
- empreinte sémantique lorsque le résultat doit être reproductible.

## 8. Moteur de recommandation

La première version reste déterministe, explicable et multicritère.

Pipeline :

1. vérifier l’éligibilité et les contraintes fortes ;
2. calculer séparément intérêts, compétences, valeurs, préparation, soutiens et barrières ;
3. redistribuer explicitement les poids lorsque des signaux sont absents ;
4. produire plusieurs scénarios plutôt qu’un métier prétendument idéal ;
5. afficher les écarts et une action permettant de tester chaque hypothèse ;
6. figer la recommandation et ses entrées dans un snapshot.

Sorties minimales :

- pourquoi cette option apparaît ;
- signaux favorables ;
- signaux défavorables ;
- données manquantes ;
- contraintes et conditions ;
- prochaine action de validation ;
- version des moteurs et référentiels.

Un modèle de machine learning ne sera envisagé qu’après collecte de résultats longitudinaux de qualité. Les clics seuls ne constituent pas une cible d’apprentissage suffisante.

## 9. Architecture de données internationales

Chaque information internationale doit distinguer :

- information officielle vérifiée ;
- information rapportée mais non confirmée ;
- règle générale ;
- décision individuelle dépendant d’une autorité ;
- date de dernière vérification.

Un programme est relié séparément à :

- l’établissement qui l’opère ;
- l’autorité qui reconnaît l’établissement ;
- l’autorité qui accrédite le programme ;
- la qualification délivrée ;
- le pays d’exercice visé ;
- l’éventuelle autorité professionnelle.

## 10. API et événements

Les contrats publics sont versionnés sous `/api/v1` puis `/api/v2` uniquement en cas de rupture réelle.

Événements métier envisagés :

```text
profile.fact.confirmed
profile.hypothesis.decided
assessment.started
assessment.completed
life_project.created
life_project.scenario.added
life_project.choice.provisional
plan.action.completed
barrier.reported
recommendation.snapshot.created
programme.verification.updated
guidance.escalation.requested
```

Au départ, ces événements peuvent être stockés dans une outbox transactionnelle interne. Aucun bus distribué n’est requis avant un besoin observé.

## 11. Sécurité, équité et audit

Exigences :

- isolation stricte par compte et délégation ;
- chiffrement en transit et au repos selon les capacités d’exploitation ;
- collecte minimale ;
- secrets hors dépôt ;
- journalisation des accès sensibles ;
- suppression ou anonymisation contrôlée ;
- tests de fonctionnement différentiel des items ;
- revue des recommandations par âge, sexe, langue, zone et niveau d’études ;
- explication des refus et options conditionnelles ;
- aucun blocage définitif fondé sur un seul score.

## 12. Contraintes de résilience

- PWA mobile-first ;
- reprise de session locale puis synchronisation ;
- sauvegarde incrémentale ;
- payloads réduits ;
- contenus essentiels disponibles avec faible bande passante ;
- opérations idempotentes ;
- horodatage et résolution explicite des conflits ;
- export imprimable/PDF des plans essentiels.

## 13. Découpage multi-agents par PR

Les agents travaillent sur des **tranches verticales indépendantes**. Une PR ne doit pas modifier simultanément plusieurs contrats centraux sans issue d’intégration dédiée.

### Vague 0 — fondations et contrats

- PR A : architecture, ADR et glossaire canonique ;
- PR B : registre des capacités et feature flags ;
- PR C : schémas `LifeProject` et machine à états, sans UI complète ;
- PR D : conventions de provenance, faits, hypothèses et preuves ;
- PR E : template PR, CODEOWNERS et garde-fous de contribution.

### Vague 1 — parcours unique

- PR F : triage initial et routage vers les modules ;
- PR G : shell du Parcours MAKOKI avec reprise ;
- PR H : création d’un projet de vie et scénarios ;
- PR I : plan d’action et jalons ;
- PR J : synthèse explicable unifiée.

### Vague 2 — domaines spécialisés

- PR K : catalogue éducation local et ISCED ;
- PR L : établissements/programmes internationaux avec provenance ;
- PR M : reconnaissance et professions réglementées ;
- PR N : compétences et passerelles métiers ;
- PR O : emploi, CV et candidatures ;
- PR P : entrepreneuriat/AGR ;
- PR Q : bien-être et escalade humaine.

### Vague 3 — validation scientifique

- PR R : registre psychométrique et statut des instruments ;
- PR S : protocole de pilote et export de données anonymisées ;
- PR T : analyses de qualité d’items hors production ;
- PR U : simulation CAT/IRT après calibration ;
- PR V : tableaux d’équité et suivi longitudinal.

## 14. Règles de coordination des agents

1. Une issue parent définit l’objectif, les invariants et les lots.
2. Chaque agent prend un lot dont les chemins de fichiers sont annoncés.
3. Les branches sont courtes : `agent/<domaine>-<lot>-v1`.
4. Les contrats partagés sont fusionnés avant les implémentations dépendantes.
5. Les agents ne modifient pas le même fichier central en parallèle sans coordination.
6. Une PR contient une seule décision principale et les tests correspondants.
7. Toute PR dépendante indique `Depends on #...` et reste en brouillon jusqu’à fusion de la dépendance.
8. Le merge est `squash`, la branche est supprimée, puis les branches dépendantes sont resynchronisées.
9. Les migrations sont additives ; leur ordre est réservé avant développement parallèle.
10. Une revue finale vérifie le diff réel, la CI, les migrations, la documentation et les limites déclarées.

## 15. Matrice de propriété recommandée

```text
/backend/src/modules/auth/**             -> identité/sécurité
/backend/src/modules/profile/**          -> profil factuel
/backend/src/modules/assessment/**       -> instruments
/backend/src/modules/life-project/**     -> projet de vie
/backend/src/modules/career/**           -> carrière/compétences
/backend/src/modules/education/**        -> éducation/mobilité
/backend/src/modules/employment/**       -> emploi
/backend/src/modules/entrepreneurship/** -> entrepreneuriat
/backend/src/modules/guidance/**         -> accompagnement
/docs/architecture/**                    -> architecture
/docs/research/**                        -> preuves scientifiques
/migrations/**                           -> revue architecture + données
/.github/workflows/**                    -> revue plateforme/CI
```

Les chemins réels seront ajustés après inventaire complet du dépôt ; cette matrice exprime les frontières cibles.

## 16. Garde de fusion

Une PR fonctionnelle ne peut être fusionnée que si :

- son issue et son périmètre sont explicites ;
- les contrats et migrations sont documentés ;
- les tests unitaires, intégration, MySQL et build applicables passent ;
- les parcours authentifiés pertinents passent ;
- les risques et limites sont affichés dans le produit lorsque nécessaire ;
- aucune affirmation scientifique ou réglementaire nouvelle n’est non sourcée ;
- aucune régression pass-to-pass n’est masquée ;
- les snapshots historiques restent relisibles ;
- la branche est à jour et les fils de revue sont résolus.

## 17. Ordre immédiat recommandé

1. fusionner cette architecture après revue ;
2. produire l’inventaire `as-is` du dépôt et la cartographie C4 actuelle ;
3. figer les contrats `LifeProject`, `Scenario`, `ActionPlan`, `Fact/Hypothesis/Evidence` ;
4. créer le shell du Parcours MAKOKI derrière un feature flag ;
5. connecter les briques déjà présentes : profil, RIASEC, ESCO/O*NET, recommandations et synthèses ;
6. ajouter ensuite les domaines éducation internationale, emploi, entrepreneuriat et accompagnement ;
7. lancer séparément le protocole scientifique et terrain.

## 18. Questions encore ouvertes

- base de données cible et calendrier éventuel de migration ;
- pays prioritaires pour les parcours internationaux ;
- autorité congolaise compétente pour chaque type de reconnaissance ;
- modèle d’accompagnement humain et responsabilités ;
- politique concernant les mineurs ;
- langues prioritaires et protocole de traduction/adaptation culturelle ;
- données terrain disponibles pour la calibration et le suivi ;
- modèle économique et gouvernance des partenaires.

Ces inconnues ne bloquent pas la définition des frontières, mais elles bloquent toute promesse de couverture complète ou de validité locale.