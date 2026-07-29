# Observabilité V5-C

Statut : composants prêts mais non raccordés au serveur central.

## Classification

Les journaux sont construits par liste blanche et validateur propre à chaque
champ. Autorisés : événement technique borné, UUID de corrélation validé ou
généré, méthode HTTP connue, modèle de route enregistré, statut HTTP 100–599,
durée positive, code d'erreur technique majuscule borné, version et
environnement énuméré.

Interdits : headers, query string, body, e-mail, identifiant de Compte, token,
cookie, réponse d'orientation, texte ou fichier de Document CV, message,
preuve utilisateur et stack brute. Les query strings et fragments ne sont
jamais sérialisés. Les métriques n'acceptent que des modèles de route
explicitement enregistrés (200 maximum) ; toute autre route devient `unknown`.
Le nombre de séries est ainsi borné par les modèles, méthodes, classes HTTP et
buckets déclarés.

## Signaux

- disponibilité et classe de statut par modèle de route ;
- latence par buckets bornés ;
- saturation : CPU, mémoire, pool MySQL, disque et files ;
- échecs de reprise, conflits de version et rollbacks ;
- résultat des sauvegardes/restaurations sans nom de fichier sensible.

Un identifiant de corrélation facilite une enquête technique ; il ne prouve ni
un usage utile ni un impact.
