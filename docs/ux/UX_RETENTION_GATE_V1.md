# Gate UX de rétention v1

Statut : proposition de contrôle produit. Ce document ne prouve ni une baisse du churn, ni une validation terrain.

## Objectif

Empêcher qu’un parcours techniquement fonctionnel donne à la personne l’impression qu’elle n’avance pas, qu’elle a perdu son travail ou qu’une action est impossible sans explication.

## Critères P0

Un parcours principal ne peut pas être déclaré prêt pour un pilote lorsque l’un de ces critères échoue :

1. la personne voit immédiatement ce qui est en cours de chargement ou d’enregistrement ;
2. une erreur de validation conserve les réponses déjà saisies ;
3. la sauvegarde locale ou distante est signalée par un message compréhensible ;
4. les doubles soumissions sont empêchées ;
5. une action indisponible explique la raison et l’étape permettant de continuer ;
6. les mêmes actions conservent les mêmes libellés et comportements ;
7. aucun terme technique interne n’est nécessaire pour accomplir l’action ;
8. une interruption réseau ne fait pas perdre une intention explicitement enregistrée.

## Critères P1

Le parcours doit montrer une valeur accumulée fondée uniquement sur des éléments observables :

- étape actuelle du projet ;
- scénario provisoirement retenu ;
- actions planifiées, en cours, terminées et bloquées ;
- informations encore manquantes ;
- dernière mise à jour connue ;
- prochaine étape proposée.

Aucun pourcentage de « réussite », de « potentiel » ou de « projet complet » ne doit être calculé sans modèle validé. Une action terminée décrit une action enregistrée, pas une réussite scolaire, professionnelle ou psychologique.

## Preuves attendues

- tests composants couvrant la progression visible ;
- test de conservation du brouillon après erreur ;
- test d’annonce de sauvegarde ;
- test expliquant un bouton ou une action indisponible ;
- smoke clavier et mobile ;
- mesure INP terrain ultérieure, séparée des tests fonctionnels.

## Références

- visibilité de l’état du système et prévention/récupération des erreurs ;
- validation qui conserve les données saisies ;
- retour visuel immédiat sur les interactions longues ;
- seuil INP recommandé : 200 ms ou moins au 75e percentile.
