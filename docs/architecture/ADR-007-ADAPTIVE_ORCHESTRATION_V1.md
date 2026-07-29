# ADR-007 — Orchestration adaptative du Parcours MAKOKI v1

Statut : proposé par V3-A

## Contexte

Le `LifeProject` canonique décrit la trajectoire, les scénarios, les plans, les actions et l’historique. Il ne doit pas être enrichi de champs temporaires propres à l’interface ou à la décision de la prochaine étape.

Le Parcours MAKOKI doit proposer une prochaine étape explicable sans construire un test universel, sans calculer un métier idéal et sans confondre disponibilité technique et validité scientifique.

## Décision

Un état séparé et versionné, `makoki-life-path-orchestration-v1`, est produit à partir de quatre catégories de signaux :

- état courant du projet de vie ;
- informations manquantes et incertitude ;
- scénarios et choix provisoire ;
- actions planifiées, en cours, terminées, bloquées ou annulées.

L’orchestrateur consulte le registre des capacités avant de proposer un module. Une capacité peut être :

- `available` lorsque son statut est `active` ou `experimental` et que ses dépendances sont disponibles ;
- `disabled` lorsqu’elle est explicitement désactivée ;
- `unavailable` lorsqu’elle est absente, legacy, inconnue ou privée d’une dépendance.

Les modules complétés ou passés sont conservés dans l’état d’orchestration et ne sont pas reproposés silencieusement.

## Règles de décision

Les règles sont déterministes, ordinales et auditées par codes de raison. Elles ne produisent ni probabilité, ni compatibilité psychologique, ni pourcentage de réussite.

Exemples :

- une action bloquée priorise le suivi ;
- un scénario actif sans action priorise la planification ;
- plusieurs scénarios sans choix priorisent la comparaison ;
- des informations manquantes ou une forte incertitude priorisent la clarification ;
- l’exploration des intérêts reste facultative et dépend de la capacité RIASEC.

## Conséquences

- le `LifeProject` reste la source canonique et ne reçoit aucun champ d’orchestration ;
- l’état produit est sérialisable, immuable et reproductible pour des entrées identiques ;
- les interfaces futures peuvent expliquer pourquoi un module est proposé ou indisponible ;
- V3-B peut étendre les actions sans redéfinir la sélection du prochain module ;
- V4 et V5 peuvent intégrer provenance, validation humaine et exploitation sans modifier le contrat métier de base.

## Hors périmètre

- persistance de l’état d’orchestration ;
- nouvel endpoint HTTP ;
- interface adaptative complète ;
- calibration psychométrique ;
- validation scientifique ou terrain ;
- activation en production.
