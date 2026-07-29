# Consentement et télémétrie

La télémétrie essentielle couvre uniquement erreurs, sauvegarde/restauration,
reprise et conflits techniques. L'analytique produit (démarrage, complétion,
actions, blocage, réorientation) exige la décision de consentement applicable et
reste désactivée par défaut.

La décision est un registre persistant append-only : chaque entrée porte le
compte propriétaire, une révision croissante, la version de la notice, la
version du catalogue événementiel et un identifiant d'événement unique. Une
révocation bloque immédiatement toute nouvelle émission produit. Un rejeu, une
révision obsolète ou une décision fondée sur une ancienne notice est refusé.

Le catalogue partagé est `backend/src/operations/event-catalog.js`. Chaque
événement déclare sa classification, son unité d'analyse et s'il nécessite un
consentement actif. Les événements sont minimisés : nom catalogué, temps,
participant pseudonymisé, résultat catégoriel et provenance bornée. Sont
interdits : identifiant direct, e-mail, token, réponse, texte de projet,
document CV, message et URL libre.

Un clic est volontairement absent du vocabulaire : il ne constitue ni résultat
intermédiaire ni preuve d'efficacité. Les statistiques descriptives ne
constituent pas une preuve causale.
