# Intégration UI du moteur Holland/RIASEC

## Objet

Ce lot raccorde l’interface MAKOKI au moteur Holland/RIASEC versionné exposé par l’API MySQL.
Il remplace, pour le parcours `/tests/riasec`, l’ancien questionnaire local, le calcul effectué dans le navigateur, l’enregistrement Supabase et les résultats simulés.

## Parcours couvert

1. création et vérification d’un compte Auth V1 ;
2. connexion avec session serveur révocable ;
3. récupération de l’instrument RIASEC disponible ;
4. création d’une passation rattachée au Compte authentifié ;
5. affichage des 60 affirmations et de l’échelle de réponse fournies par l’API ;
6. soumission finale des réponses au serveur ;
7. calcul serveur versionné ;
8. affichage du Résultat d’orientation ;
9. consultation de l’historique réel du Compte.

## Garanties de conception

- le navigateur ne reçoit ni la dimension associée à un item ni sa clé d’inversion ;
- aucun calcul RIASEC n’est effectué dans le frontend ;
- aucun `confidenceScore`, percentile, fidélité ou validité psychométrique n’est inventé ;
- les égalités en tête sont affichées sans forcer un code Holland à trois lettres ;
- les scores, le classement, la différenciation et les indicateurs de réponse proviennent du résultat persisté par l’API ;
- l’historique est filtré par le Compte authentifié ;
- la page de résultat rappelle que l’outil n’est ni un diagnostic psychologique ni une garantie de réussite.

## Reprise de passation

Le backend ne dispose pas encore d’un endpoint de sauvegarde partielle. La reprise intermédiaire est donc limitée à un brouillon `localStorage` :

- elle fonctionne seulement sur le même navigateur et le même appareil ;
- les réponses détaillées ne sont envoyées au serveur qu’à la soumission finale ;
- une suppression des données du navigateur fait perdre le brouillon ;
- la reprise multi-appareils exige un futur endpoint d’autosauvegarde côté serveur.

## Éléments explicitement hors périmètre

Ce lot ne fournit pas encore :

- le référentiel de 500 à 1 000 métiers ;
- le moteur de recommandations adapté au Congo ;
- les parcours de formation associés ;
- le rapport candidat PDF ;
- l’administration des instruments et des publications ;
- l’affectation d’un résultat à un conseiller ;
- la validation psychométrique de l’instrument ;
- le remplacement de tous les autres tests historiques de l’application ;
- la suppression définitive des anciens fichiers RIASEC devenus inutilisés.

La route générique historique `/test-results` conserve encore des données de démonstration pour les anciens tests. Le parcours RIASEC réel utilise exclusivement :

- `/orientation/results` ;
- `/orientation/results/:resultId`.

## Configuration de recette

```env
AUTH_V1_ENABLED=true
RIASEC_API_ENABLED=true
RIASEC_ALLOW_DRAFT=true
```

`RIASEC_ALLOW_DRAFT=true` doit rester limité à la recette ou au pilote. Une mise en production publique doit utiliser un instrument passé au statut `pilot` ou `active` selon le processus de validation retenu.

L’inscription Auth V1 exige également un SMTP fonctionnel. Une configuration SMTP factice permet au serveur de démarrer mais ne permet pas de recevoir le lien `/verify-email`.

## Validation obligatoire

```bash
npm ci
npm --prefix backend ci
npm run check
npm --prefix backend run test:mysql
npm run test:e2e
```

Puis valider manuellement :

1. connexion d’un Compte actif ;
2. démarrage d’une passation ;
3. présence de 60 affirmations ;
4. reprise locale après rechargement de la page ;
5. refus d’une soumission incomplète ;
6. création d’un Résultat d’orientation ;
7. affichage correct d’un cas avec égalité ;
8. présence du résultat dans l’historique ;
9. impossibilité de lire le résultat d’un autre Compte ;
10. renouvellement de la session après expiration de l’access token.

## État de validation

Les modifications ont été produites sur une branche dédiée. Aucune exécution complète des tests, aucune fusion et aucun déploiement ne sont déclarés par ce document.
