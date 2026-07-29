# Protocole équité, accessibilité et sécurité humaine v1

Statut : cadre conçu, audit terrain non exécuté

Version : `makoki-equity-accessibility-safety-v1`

Issue : #98, lot V4-D

## 1. Principes

Ce protocole recherche des différences observées sans inventer une équité, une
discrimination ou une causalité. Une absence de données reste une inconnue.
MAKOKI ne produit aucun diagnostic psychologique ou médical.

## 2. Dimensions d’observation

Seulement lorsque la collecte est consentie, nécessaire et suffisamment
documentée, l’analyse peut décrire :

- âge par groupes préspécifiés et justifiés ;
- sexe ou genre selon les catégories effectivement recueillies ;
- langue utilisée pendant la tâche ;
- niveau scolaire déclaré ;
- handicap ou besoin d’accessibilité déclaré volontairement ;
- connectivité et terminal observés pendant la session ;
- contexte socio-économique au moyen d’indicateurs explicités, jamais déduits
  d’un nom, d’une adresse ou d’un comportement.

Les catégories non représentées, refusées ou inconnues sont publiées comme
telles. Aucun groupe n’est décrit comme homogène.

## 3. Garde statistique

Avant toute comparaison, le rapport indique l’effectif total, l’effectif de
chaque groupe, les données manquantes, la méthode, l’incertitude et les tests
multiples éventuels.

Si un groupe est trop petit pour l’analyse préspécifiée ou si un résultat
risque de réidentifier une personne :

- aucune métrique comparative ni « score d’équité » n’est calculé ;
- les valeurs sont supprimées ou regroupées selon un plan approuvé ;
- la limite est signalée explicitement ;
- une collecte complémentaire peut être proposée, sans remplir les données.

Les seuils ne sont pas codés arbitrairement dans ce document : ils doivent être
fixés avant analyse par une personne compétente selon le plan et le risque.

## 4. Indicateurs descriptifs autorisés

- accomplissement d’une tâche définie ;
- abandon observé et raison déclarée ou inconnue ;
- temps de tâche, avec contexte technique ;
- erreurs d’interface observées ;
- compréhension reformulée ;
- recours à une aide humaine ;
- réussite ou échec de reprise après coupure.

Ils ne deviennent pas un score psychologique, un potentiel, une aptitude ou
une probabilité de réussite.

## 5. Accessibilité

### Clavier

- ordre de tabulation logique ;
- focus visible ;
- aucune action disponible uniquement au survol ;
- activation Entrée/Espace conforme aux contrôles natifs ;
- échappement des dialogues et retour du focus.

### Lecteurs d’écran

- structure de titres cohérente ;
- noms accessibles et erreurs reliées aux champs ;
- statuts annoncés sans répétition excessive ;
- texte alternatif utile, images décoratives ignorées ;
- pas d’information portée uniquement par la couleur.

### Contraste et langage

- contraste vérifié selon WCAG 2.2 AA pour les composants concernés ;
- zoom et réarrangement sans perte ;
- phrases courtes, vocabulaire expliqué et absence de verdict ;
- distinction lisible entre déclaré, hypothèse, vérifié et inconnu.

### Mobile et faible bande passante

- largeur de 320 px sans défilement horizontal essentiel ;
- cibles tactiles suffisantes ;
- parcours utilisable sans image lourde ;
- états chargement, coupure, reprise et erreur explicites ;
- aucune perte silencieuse ;
- budget réseau mesuré dans le contexte du parcours testé.

## 6. Sécurité humaine et bien-être

MAKOKI peut aider à organiser une réflexion ; il ne dépiste, ne diagnostique et
ne traite aucun trouble. Il ne doit pas interpréter une détresse, une maladie,
un handicap ou une urgence.

L’interface doit :

- permettre de passer une question et de quitter le parcours ;
- éviter culpabilisation, urgence artificielle et promesse ;
- proposer un accompagnement humain lorsque la personne le demande ou lorsque
  le périmètre de MAKOKI est dépassé ;
- utiliser uniquement un annuaire de professionnels ou services dont la
  source, la zone, la date et le statut de vérification sont établis ;
- ne jamais inventer un contact, un service local ou une disponibilité.

En présence d’un risque immédiat rapporté, le produit ne tente pas un
diagnostic automatique. Le protocole d’escalade et les coordonnées doivent
être validés pour le pays et la date concernés avant toute publication.

## 7. Matrice de preuve

Chaque constat d’audit porte :

- version du produit et du protocole ;
- date et environnement ;
- méthode et outil ;
- périmètre et population réellement observée ;
- résultat brut ou référence protégée ;
- limite et donnée manquante ;
- responsable humain ;
- statut `not_tested`, `observed`, `confirmed`, `needs_review` ou `withdrawn`.

`observed` ne signifie ni validation scientifique, ni réalité généralisable.

## 8. Gate

Une capacité n’est pas déclarée équitable, accessible ou sûre sur la seule base
d’une CI verte. Le rapport final sépare conception, test automatisé, audit
humain, observation terrain et validation scientifique.
