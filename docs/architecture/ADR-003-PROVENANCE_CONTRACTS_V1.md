# ADR-003 — Provenance `Fact`, `Hypothesis` et `Evidence` v1

Statut : accepté pour la Vague 0

Issue : #79

## Contexte

MAKOKI doit empêcher qu’une déclaration, une hypothèse algorithmique, un document, une information institutionnelle ou une décision humaine soient présentés comme une même catégorie de vérité.

Le profil existant distingue déjà certaines hypothèses confirmées ou rejetées. Le besoin W0-D est transversal : fournir un vocabulaire commun sans déplacer ni réécrire immédiatement le module profil.

## Décision

Un module pur `backend/src/provenance/**` introduit le contrat `makoki-provenance-v1`.

### EvidenceV1

Une preuve décrit une entité ou observation pouvant soutenir une décision. Elle porte notamment :

- son type et son sujet éventuel ;
- sa source ;
- sa date d’observation ;
- sa portée ;
- son statut de vérification ;
- ses informations d’intégrité ;
- ses restrictions d’accès.

Une preuve externe marquée `verified` doit référencer une autorité, une date de récupération et une version. La présence d’une source web ou institutionnelle ne rend pas automatiquement l’information vraie dans la vie de l’utilisateur.

### HypothesisV1

Une hypothèse est créée au statut `proposed`. Elle contient :

- son générateur et sa version ;
- sa justification ;
- les preuves associées ;
- un niveau d’incertitude descriptif ;
- un historique de décisions.

Elle ne peut devenir `confirmed` ou `rejected` qu’au moyen d’un événement de décision porté par un acteur humain. Une décision finale n’est pas écrasée : elle peut seulement être remplacée par un événement `superseded` explicite.

### FactV1

Un fait contient :

- un sujet, un prédicat et une valeur JSON ;
- une source ;
- une méthode de confirmation ;
- l’acteur humain ou l’autorité ayant confirmé ;
- les preuves liées ;
- les dates d’observation et de validité ;
- l’incertitude et les restrictions d’accès.

Un système ne peut pas confirmer seul un fait. La promotion d’une hypothèse vers un fait exige d’abord une hypothèse confirmée et une confirmation distincte.

## Alignement conceptuel

La décision reprend les idées minimales du modèle W3C PROV :

- `Entity` : fait, hypothèse, preuve ou objet référencé ;
- `Activity` : génération, observation, décision ou confirmation ;
- `Agent` : personne, autorité ou système responsable d’une activité.

Le contrat MAKOKI reste un modèle applicatif JSON et n’impose pas RDF ou OWL dans cette phase.

## Invariants

1. Tous les objets portent `schemaVersion = makoki-provenance-v1`.
2. Une hypothèse est créée comme proposition, jamais directement comme confirmation.
3. La confirmation ou le rejet d’une hypothèse exige une décision humaine historisée.
4. Les événements de décision ont des identifiants uniques.
5. Une décision finale ne peut être écrasée silencieusement.
6. Un fait ne peut être confirmé uniquement par un acteur système.
7. Une vérification externe exige une autorité, une date et une version.
8. Les pourcentages de confiance non calibrés sont refusés ; l’incertitude reste descriptive et justifiée.
9. Les intervalles de validité incohérents sont refusés.
10. Les objets sont sérialisables et profondément immuables.

## Compatibilité avec les hypothèses de profil existantes

Le module `backend/src/profile/**` n’est pas modifié dans ce lot.

Correspondance future :

| Profil actuel | Provenance v1 |
|---|---|
| `id` | `HypothesisV1.id` |
| `hypothesis_type` | `hypothesisType` |
| `value_json` | `value` |
| `rationale` | `rationale[]` |
| `status = proposed/confirmed/rejected` | `status` dérivé des décisions |
| `created_at`, `updated_at` | dates du contrat |
| `confidence` numérique | non repris comme probabilité ; conversion en incertitude descriptive à décider |

Une future PR d’adaptation devra préserver les décisions existantes, produire des événements explicites et éviter toute promotion automatique vers `FactV1`.

## Non-décisions

Ce lot ne décide pas :

- de la persistance MySQL ;
- des pièces justificatives et de leur stockage ;
- de l’interface de confirmation ;
- des autorités compétentes pour un diplôme donné ;
- des règles juridiques de reconnaissance ;
- de l’usage obligatoire d’un LLM.

## Références

- W3C PROV-O : https://www.w3.org/TR/prov-o/
- W3C PROV Overview : https://www.w3.org/TR/prov-overview/
- Architecture cible : `docs/architecture/MAKOKI_LIFE_PATH_ENGINE.md`
