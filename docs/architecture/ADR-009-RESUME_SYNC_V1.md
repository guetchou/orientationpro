# ADR-009 — Reprise locale et synchronisation prudente v1

Statut : proposé par V3-C

## Contexte

Le Parcours MAKOKI doit rester consultable avec une connexion instable. Une action ou une transition peut être décidée hors ligne, mais le cache local ne doit jamais remplacer silencieusement la source canonique MySQL.

## Décision

Le frontend conserve une file JSON versionnée `makoki-life-project-sync-queue-v1`.

Chaque commande contient :

- un identifiant stable ;
- le projet concerné ;
- la version canonique observée avant la coupure ;
- le type de commande et sa charge utile minimale ;
- la date de création ;
- la date de confirmation explicite par la personne.

Les commandes prises en charge sont la sélection provisoire d’un scénario, la transition d’état et la mise à jour ciblée d’une action.

## Double confirmation

1. La personne confirme l’enregistrement local de son intention.
2. Après reconnexion, elle confirme la reprise des écritures.

Aucune écriture n’est envoyée automatiquement au retour du réseau.

## Réconciliation

Avant la reprise :

- la version distante est relue ;
- si elle diffère de la version de base locale, la reprise s’arrête ;
- le conflit est affiché et les commandes restent conservées ;
- aucune fusion implicite de textes, statuts ou choix n’est réalisée.

Lorsque la version correspond, les commandes sont envoyées dans leur ordre local. Chaque réponse fournit la version utilisée par la commande suivante. L’identifiant stable permet au serveur de reconnaître un rejeu.

## Faible bande passante

- lecture depuis le dernier cache lorsque le réseau est indisponible ;
- commandes ciblées plutôt que renvoi du projet complet ;
- arrêt au premier conflit ou échec ;
- conservation locale des commandes non appliquées.

## Conséquences

- le cache est explicitement signalé comme non canonique ;
- les boutons restent utilisables hors ligne pour enregistrer une intention confirmée ;
- l’utilisateur peut reprendre manuellement la synchronisation ;
- V3-D peut présenter l’état adaptatif et les actions en s’appuyant sur la même discipline de version.

## Hors périmètre

- résolution automatique des conflits ;
- synchronisation entre plusieurs appareils ;
- chiffrement applicatif supplémentaire du stockage navigateur ;
- arrière-plan silencieux ou service worker d’écriture ;
- activation publique.
