# ADR 0006 — Recommandations métiers contextualisées par le profil Auth V1

- Statut : proposé pour implémentation
- Date : 2026-07-29
- Périmètre : première tranche du Lot 2, issue #44

## Contexte

Le classement existant compare un Résultat d’orientation RIASEC aux profils numériques O*NET. Il est déterministe, versionné et traçable, mais il ne tient pas compte du profil Auth V1 désormais disponible : objectif principal, études et compétences ESCO confirmées.

ESCO prévoit explicitement l’usage des relations entre occupations et compétences pour le matching et l’orientation. O*NET fournit les profils d’intérêts RIASEC ainsi que les Job Zones, qui regroupent des occupations demandant des niveaux comparables d’éducation, d’expérience et de formation. Ces données ne décrivent toutefois ni le marché du travail congolais, ni une équivalence officielle de diplôme.

## Décision

MAKOKI ajoute une couche de classement déterministe `career-profile-context-v1` au-dessus du score RIASEC existant `career-riasec-cosine-rank-v1`.

Les signaux admissibles sont :

1. proximité RIASEC, toujours présente et toujours majoritaire ;
2. compétences dont l’URI ESCO est confirmée dans le profil ;
3. niveau d’études déclaré, comparé prudemment à la Job Zone O*NET ;
4. objectif principal, utilisé uniquement pour choisir les pondérations ;
5. mobilité, exposée comme contexte mais non scorée tant qu’un référentiel géographique local versionné n’existe pas.

Les pondérations configurées sont :

| Objectif | RIASEC | Compétences | Préparation |
|---|---:|---:|---:|
| Choisir ses études | 80 % | 20 % | 0 % |
| Trouver un emploi | 60 % | 30 % | 10 % |
| Réussir une reconversion | 65 % | 30 % | 5 % |
| Développer ses compétences | 70 % | 30 % | 0 % |
| Créer une activité | 75 % | 25 % | 0 % |
| Autre ou absent | 70 % | 25 % | 5 % |

Lorsqu’un signal est absent, sa pondération est redistribuée proportionnellement entre les signaux disponibles. Une information manquante n’est donc jamais transformée en score nul.

## Compétences

Seules les lignes `account_profile_skills` avec `confirmation_status='confirmed'` et une URI ESCO sont utilisées. Le moteur relie cette URI au catalogue local, puis aux relations métier-compétence ESCO. Il pondère la preuve selon :

- la maîtrise déclarée ;
- la nature `essential`, `important`, `optional` ou `related` de la relation ;
- une déduplication déterministe par URI.

Les compétences libres sans URI ESCO restent visibles dans le profil, mais n’affectent pas le classement.

## Préparation académique

Le niveau d’études le plus élevé, terminé ou en cours, est rapproché d’un repère interne dérivé des cinq Job Zones O*NET. Ce composant indique seulement une proximité de préparation. Il ne constitue pas :

- une équivalence officielle de diplôme ;
- une condition réglementaire d’accès au métier ;
- une évaluation de compétence professionnelle ;
- une mesure adaptée au Congo sans revue locale.

Chaque réponse API restitue le statut du repère, son score, la Job Zone utilisée et un avertissement explicite.

## API et sécurité

L’endpoint est :

```text
GET /api/v1/career/recommendations/:resultId
```

Il exige l’authentification et la permission `career.match.read_own`. Le propriétaire vient exclusivement de `req.auth.account.id`. Un identifiant de compte fourni par le client n’est jamais utilisé. Un résultat absent ou appartenant à un autre compte répond de manière non énumérante comme le classement RIASEC existant.

## Restitution

Chaque métier expose :

- le score contextualisé ;
- le score RIASEC initial ;
- les scores compétences et préparation lorsqu’ils sont disponibles ;
- les pondérations configurées et réellement appliquées ;
- les compétences ESCO reliées ;
- des explications structurées ;
- des limites et avertissements.

Le texte ne présente jamais le score comme une garantie d’emploi, de salaire, de réussite ou d’aptitude réglementaire.

## Conséquences et limites

- Le classement peut changer après confirmation d’une compétence, modification du niveau d’études ou de l’objectif principal.
- Le résultat reste reproductible pour une même version de l’algorithme et les mêmes données sources.
- Aucune donnée de salaire, de débouché ou de disponibilité locale n’est utilisée.
- La pertinence locale congolaise demeure gouvernée par `local_relevance_status` et nécessite une revue éditoriale séparée.
- Le catalogue de formations et les recommandations de parcours de formation restent hors de cette tranche.
- Une future version devra produire un instantané immutable si le classement contextualisé devient un élément du rapport individuel.
