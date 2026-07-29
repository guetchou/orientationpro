# ADR-006 — Triage et shell du Parcours MAKOKI v1

Statut : accepté pour W1-C

## Décision

La première interface du projet de vie est une route authentifiée `/parcours`. Elle vérifie d’abord le registre public des capacités et n’appelle l’API LifeProject que lorsque `life-project.core-v1` est configurée avec un statut `active` ou `experimental`.

L’entrée utilisateur est un triage court fondé sur :

- la situation actuelle déclarée ;
- le besoin principal ;
- le périmètre de mobilité envisagé ;
- l’horizon d’action ;
- une précision libre facultative.

Le triage ne choisit aucun instrument psychométrique et ne produit aucun verdict. Il crée un projet en `exploration` et tente d’ajouter un premier scénario à vérifier.

## Reprise et réseau instable

- le brouillon du triage est conservé dans `localStorage` jusqu’à confirmation de la création ;
- la dernière enveloppe de projet lisible est mise en cache pour consultation hors ligne ;
- le cache hors ligne est explicitement présenté comme une version locale en lecture seule ;
- la création en deux écritures reste récupérable : si le projet est créé mais que l’ajout du scénario est interrompu par le réseau, le projet apparaît au prochain chargement ;
- aucune mutation n’est tentée en mode hors ligne.

## Shell

Le shell affiche :

- l’état courant du projet ;
- les scénarios et le scénario provisoirement retenu ;
- les informations manquantes ;
- des prochaines étapes calculées à partir de l’état observable ;
- le passage explicite d’`exploration` à `clarification`.

Les prochaines étapes affichées sans plan persistant sont des invitations d’interface, non des recommandations scientifiques ou des garanties.

## Garde-fous

- toutes les informations initiales sont présentées comme déclarées ;
- le statut de la fonctionnalité reste `Expérimental` ;
- les routes historiques et tests existants ne sont pas supprimés ;
- aucune promesse d’admission, d’emploi, de revenu ou de réussite ;
- navigation au clavier, libellés de formulaire, alertes accessibles et mise en page mobile-first ;
- aucune donnée de projet n’est créée lorsque la capacité est désactivée.

## Limites

- pas encore d’édition détaillée des scénarios, critères et plans ;
- pas de synchronisation de brouillon multi-appareils ;
- le cache local n’est pas une source canonique ;
- aucun travail scientifique ou terrain n’est validé par cette interface ;
- l’activation en production reste contrôlée par le backend.