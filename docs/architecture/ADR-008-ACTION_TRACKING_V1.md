# ADR-008 — Suivi descriptif et historisé des actions v1

Statut : proposé par V3-B

## Contexte

Le contrat `LifeProject` contient déjà les plans et actions canoniques. Il conserve leur statut courant, les preuves référencées et les raisons de blocage, mais pas l’ordre personnalisé ni l’historique complet de chaque changement de statut.

La Vague 3 doit permettre le suivi et la reprise sans transformer l’activité de la personne en score psychologique ou en pourcentage de réussite.

## Décision

Une projection persistante séparée, `makoki-life-project-action-tracking-v1`, conserve pour chaque action :

- le projet et le plan concernés ;
- la position explicite dans les prochaines actions ;
- un historique ordonné des changements de statut ;
- l’acteur, la date, la raison et un identifiant de commande stable.

Les statuts restent ceux du contrat canonique :

```text
planned → in_progress → completed
       ↘ blocked ↗
       ↘ cancelled
```

Certaines transitions de reprise sont autorisées, notamment `completed → planned` et `cancelled → planned`, afin de ne pas rendre une décision irréversible. Toute transition refusée échoue explicitement.

Le statut courant reste aussi écrit dans l’action canonique. La projection de suivi sert à l’historique, à l’ordre et à l’idempotence ; elle ne remplace pas le projet de vie.

## Concurrence et idempotence

- la mutation canonique exige `If-Match` ou `expectedVersion` ;
- l’identifiant `commandId` empêche la duplication d’une commande rejouée ;
- la réutilisation contradictoire d’un identifiant produit un conflit ;
- aucune version obsolète ne peut écraser le projet courant.

## Progression

Le résumé expose seulement :

- les nombres d’actions planifiées, en cours, terminées, bloquées et annulées ;
- un état descriptif `not_started`, `planned`, `underway`, `blocked` ou `completed` ;
- les prochaines actions ordonnées ;
- les preuves et raisons de blocage déjà enregistrées.

Aucun pourcentage de réussite, score psychologique ou causalité n’est produit.

## Conséquences

- une migration 012 ajoute une table de projection indépendante ;
- l’API expose la progression et la mise à jour ciblée d’une action ;
- la lecture et l’écriture restent isolées par compte ;
- V3-C pourra synchroniser les commandes hors ligne en s’appuyant sur la version canonique et les identifiants de commande.

## Limite connue

La sauvegarde du projet canonique et celle de la projection de suivi sont effectuées successivement par le service. Une panne entre les deux laisse le projet canonique valide, mais peut demander une reconstruction de la projection. La Vague 3-C doit traiter la reprise et la réconciliation explicite ; aucune incohérence n’est masquée.
