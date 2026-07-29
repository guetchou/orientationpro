# ADR-002 — Contrats `LifeProject` et machine à états v1

Statut : accepté pour la Vague 0

Issue : #78

## Contexte

MAKOKI doit représenter un projet de vie évolutif sans réduire une personne à un score ou à un choix définitif. Les interfaces, la persistance et les recommandations dépendront de contrats communs ; ils doivent donc être stabilisés avant ces couches.

## Décision

Le lot W0-C introduit des contrats CommonJS purs, sérialisables en JSON et sans dépendance externe :

- `LifeProjectV1` ;
- `LifeProjectScenarioV1` ;
- `DecisionCriterionV1` ;
- `ActionPlanV1` ;
- `ActionItemV1` ;
- événements d’historique ;
- machine à états explicite.

La machine suit un modèle événementiel inspiré des principes des statecharts : un état courant, des transitions autorisées, un événement explicite et un historique append-only.

```text
exploration
  -> clarification
  -> comparison
  -> provisional_choice
  -> preparation
  -> experimentation
  -> action
  -> follow_up
  -> confirmation

Chaque étape peut conduire à reorientation.
confirmation -> reorientation reste autorisée.
```

Les retours vers une étape antérieure sont autorisés lorsqu’ils sont explicites. Aucune transition n’efface l’historique précédent.

## Invariants

1. Chaque objet porte `schemaVersion = makoki-life-project-v1`.
2. Les identifiants sont uniques dans leur collection.
3. Un plan d’action référence un scénario présent dans le projet.
4. Un scénario actif est sélectionné explicitement et historisé.
5. Les données manquantes et l’incertitude restent visibles.
6. Les valeurs d’énumération inconnues sont refusées, pas corrigées silencieusement.
7. Les objets produits sont profondément gelés et sérialisables.
8. Une confirmation n’est pas irréversible : une réorientation explicite reste possible.
9. Aucun score psychologique universel n’est défini dans ces contrats.

## Non-décisions

Ce lot ne décide pas :

- du schéma MySQL ;
- des routes HTTP ;
- du shell frontend ;
- du moteur de recommandation ;
- des règles de reconnaissance académique ;
- des droits parent/conseiller.

## Conséquences

Les couches futures doivent utiliser ces constructeurs ou produire des objets compatibles. Toute rupture nécessitera une nouvelle version de contrat. La persistance devra conserver les événements d’historique et ne pas reconstruire silencieusement un passé différent.

## Références

- W3C, State Chart XML (SCXML) 1.0 : https://www.w3.org/TR/scxml/
- Architecture cible : `docs/architecture/MAKOKI_LIFE_PATH_ENGINE.md`
