# Modèle de menace MAKOKI v1

Statut : revue V5-A, préparation uniquement. Ce document ne vaut ni
homologation ni autorisation d’activer le Parcours MAKOKI.

## Périmètre et preuves

Le périmètre est reconstruit sur le `main` intégré `c561790`. Il couvre
identité v1, Sessions, Profils, LifeProject, Résultats d’orientation,
accompagnement humain, Documents CV, rôles privilégiés, interfaces legacy,
MySQL, Docker et GitHub Actions. Les issues V3 #97, V4 #98 et infrastructure
#128 sont fermées ; elles ne constituent plus des dépendances ouvertes.

Faits vérifiés :

- tokens d’accès limités à 15 minutes ; refresh tokens opaques, hachés,
  rotatifs et révocables côté serveur ;
- API v1 Profil, RIASEC, métiers, CV et LifeProject protégées par Session
  active, ownership et version optimiste selon le contrat concerné ;
- reprise LifeProject locale et synchronisation versionnée présentes, avec
  refus des écritures obsolètes testé en V3 ;
- consentement Guidance révocable, strictement chronologique et historisé avec
  acteur, date, périmètre, décision et motif ;
- flags découverts depuis `backend/.env.example` et exigés à `false` par
  l’audit V5-A ;
- workflows exigés avec permissions globales et par job en lecture seule ;
- routes legacy encore montées sans flag global ;
- aucun rate limiter central raccordé au serveur Express ;
- logs legacy dispersés et non systématiquement expurgés.

## Actifs et frontières

| Actif | Menace | Contrôle observé | État |
|---|---|---|---|
| Identité et Sessions | vol, rejeu, brute force | cookie HttpOnly, rotation, révocation, JWT borné | rate limit manquant |
| Profil et LifeProject | lecture inter-Compte, écriture obsolète, reprise divergente | ownership, version, historique, tests multi-Compte V3 | revalider après chaque raccord V5 |
| Guidance | consentement rejoué, conseiller non autorisé, parole écrasée | attribution, permission, révocation chronologique, événements append-only | module non activé |
| Résultats d’orientation | divulgation ou falsification | Session, Permission, calcul serveur | revalider dans le gate |
| Documents CV | exfiltration, fichier hostile | 5 MiB, type/signature, Permission, ownership | isolation CPU/temps à prouver |
| Rôles privilégiés | abus de privilège | Permissions atomiques v1 | alias legacy à retirer |
| Administration | accès non autorisé | preuves incomplètes | bloquant |
| Journaux | fuite token, réponse, document ou donnée personnelle | sérialisation V5-A par allowlist, non raccordée | raccord #124 bloquant |
| CI et dépendances | supply-chain | permissions lecture, lockfiles | matrice #126 requise |

## Scénarios prioritaires

1. Automatisation de login/reset/vérification : prise de Compte ou déni de
   service. Exiger limites par IP et identité pseudonymisée, 429 et métriques.
2. Modification d’un identifiant : exposition inter-Compte. Exiger des tests
   MySQL multi-Compte négatifs sur chaque point d’entrée et chaque store.
3. Reprise LifeProject hors ligne : écrasement d’une version plus récente.
   Exiger conflit explicite, reprise idempotente et conservation de l’historique.
4. Consentement Guidance ancien rejoué après révocation : accès indu. Conserver
   le refus chronologique et l’autorisation fail-closed.
5. Document hostile : contournement de type ou épuisement. Les limites v1
   existent ; l’isolation et les limites CPU/temps restent à prouver.
6. Erreur contenant token, réponse ou texte brut : exfiltration par logs.
   Exiger logger structuré par liste blanche et tests canaris.
7. Route legacy contournant auth v1 : accès non autorisé. Exiger flag global
   `false`, matrice route/Permission puis retrait après preuve de remplacement.
8. Action GitHub compromise : supply-chain. Refuser toute permission d’écriture
   et `pull_request_target` sans revue de menace dédiée.

## Conditions de sortie

- aucun secret, token, réponse sensible ou document brut dans les logs ;
- rate limits testés sur auth et charges coûteuses ;
- matrice Session/Permission/ownership et tests multi-Compte complets ;
- reprise LifeProject et conflits de version testés après chaque intégration ;
- consentement actif et révocation Guidance testés sans rejeu possible ;
- routes legacy désactivables par défaut ;
- vulnérabilités hautes/critiques corrigées ou acceptées formellement ;
- raccord redaction et audits GitHub exécutés dans la CI du dernier SHA.

Confiance : élevée sur la présence des contrats V3/V4 dans `c561790`, moyenne
sur leurs futurs raccordements V5, faible sur les surfaces legacy. Une
compilation ou une CI verte ne prouve pas l’absence d’exfiltration ni
l’efficacité opérationnelle.
