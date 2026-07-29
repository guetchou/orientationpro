# Modèle de menace MAKOKI v1

Statut : revue V5-A, préparation uniquement. Ce document ne vaut ni
homologation ni autorisation d'activer le Parcours MAKOKI.

## Périmètre et preuves

Le périmètre observé à `3722eb2` couvre identité v1, Sessions, Profils,
Résultats d'orientation, Documents CV, rôles privilégiés, interfaces legacy,
MySQL, Docker et GitHub Actions. V3-A et V3-B sont fusionnés via #101 et #104 ;
les autres lots Vague 3 et toute la Vague 4 ne le sont pas. Leur intégration n'est donc pas
validée ici.

Faits vérifiés :

- tokens d'accès limités à 15 minutes ; refresh tokens opaques, hachés,
  rotatifs et révocables côté serveur ;
- API v1 Profil, RIASEC, métiers et CV protégées par Session active ;
- accès CV v1 filtrés par `accountId`, Permission, taille, type et signature ;
- nouveaux flags de `backend/.env.example` à `false` par défaut ;
- workflows existants avec permission globale `contents: read` ;
- routes legacy hors `/api/v1` montées sans flag global, dont des mutations sans
  authentification ;
- aucun rate limiter central raccordé au serveur Express ;
- logs legacy dispersés et non systématiquement expurgés.

## Actifs et frontières

| Actif | Menace | Contrôle observé | État |
|---|---|---|---|
| Identité et Sessions | vol, rejeu, brute force | cookie HttpOnly, rotation, révocation, JWT borné | rate limit manquant |
| Profil / projet de vie | lecture ou écrasement inter-Compte | filtres `accountId`, contrat V3-A | autres lots V3 absents |
| Résultats d'orientation | divulgation, falsification | Session, Permission, calcul serveur | revalider après V3 |
| Documents CV | exfiltration, fichier hostile | 5 MiB, type/signature, Permission, ownership | legacy parallèle bloquant |
| Rôles privilégiés | abus de privilège | Permissions atomiques v1 | legacy à isoler |
| Administration | accès non autorisé | preuves incomplètes | bloquant |
| Journaux | fuite token/réponse/document | helper V5-A testé mais non raccordé | bloquant |
| CI/dépendances | supply-chain | droits lecture, lockfiles | audit requis |

## Scénarios prioritaires

1. Automatisation de login/reset/vérification : prise de Compte ou déni de
   service. Exiger limites par IP et identité pseudonymisée, 429 et métriques.
2. Modification d'un identifiant d'URL : exposition inter-Compte. Exiger tests
   MySQL multi-Compte négatifs sur chaque store.
3. Document hostile : contournement de type ou épuisement. Les limites v1
   existent ; l'isolation et les limites CPU/temps restent à prouver.
4. Erreur contenant token, réponse ou texte brut : exfiltration par logs.
   Exiger logger structuré par liste blanche et tests canaris.
5. Route legacy contournant auth v1 : accès non autorisé. Exiger flag global
   `false`, matrice route/Permission puis retrait après preuve de remplacement.
6. Action GitHub compromise : supply-chain. Garder permissions minimales et
   ajouter l'analyse dans une PR workflow courte, épinglée et coordonnée.

## Conditions de sortie

- aucun secret, token, réponse sensible ou document brut dans les logs ;
- rate limits testés sur auth et charges coûteuses ;
- matrice Session/Permission/ownership et tests multi-Compte complets ;
- routes legacy désactivables par défaut ;
- audits production sans vulnérabilité haute/critique non acceptée ;
- raccord redaction et analyses GitHub via PR courtes coordonnées.

Confiance : moyenne sur le code v1 inspecté, faible sur les surfaces legacy,
faible sur V3-A/B récemment fusionnés, nulle sur V3-C à V3-F et V4. Une compilation ou une CI verte ne prouve pas
l'absence d'exfiltration ni l'efficacité opérationnelle.
