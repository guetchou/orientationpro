# Observabilité V5-C

Statut : composants prêts mais non raccordés au serveur central.

## Classification

Les journaux sont construits par liste blanche. Autorisés : événement,
identifiant de corrélation aléatoire, méthode, modèle de route, classe de statut,
durée, code d'erreur technique, version et environnement.

Interdits : headers, query string, body, e-mail, identifiant de Compte, token,
cookie, réponse d'orientation, texte ou fichier de Document CV, message,
preuve utilisateur et stack brute. Les métriques remplacent identifiants
numériques et UUID par `:id`.

## Signaux

- disponibilité et classe de statut par modèle de route ;
- latence par buckets bornés ;
- saturation : CPU, mémoire, pool MySQL, disque et files ;
- échecs de reprise, conflits de version et rollbacks ;
- résultat des sauvegardes/restaurations sans nom de fichier sensible.

Un identifiant de corrélation facilite une enquête technique ; il ne prouve ni
un usage utile ni un impact.
