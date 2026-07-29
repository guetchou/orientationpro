# Modèle de menace MAKOKI v1

Statut : revue V5-A, préparation uniquement. Ce document ne vaut ni
homologation ni autorisation d’activer le Parcours MAKOKI.

## Périmètre et preuves

Le périmètre est reconstruit sur le `main` intégré `de5a298`, qui contient
#103, #121 et #123. Il couvre
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
- routes legacy regroupées derrière `LEGACY_API_ENABLED=false`, avec inventaire
  complet exigé et tests fail-closed par #121 ;
- limiteurs centralisés par portée (`general`, `auth`, `expensive`) raccordés au
  serveur Express, avec clés opaques et cardinalité mémoire bornée par #123 ;
- logs legacy dispersés et non systématiquement expurgés.

## Actifs et frontières

| Actif | Menace | Contrôle observé | État |
|---|---|---|---|
| Identité et Sessions | vol, rejeu, brute force | cookie HttpOnly, rotation, révocation, JWT borné, limites par portée | charge réelle et comportement multi-instance à prouver |
| Profil et LifeProject | lecture inter-Compte, écriture obsolète, reprise divergente | ownership, version, historique, tests multi-Compte V3 | revalider après chaque raccord V5 |
| Guidance | consentement rejoué, conseiller non autorisé, parole écrasée | attribution, permission, révocation chronologique, événements append-only | module non activé |
| Résultats d’orientation | divulgation ou falsification | Session, Permission, calcul serveur | revalider dans le gate |
| Documents CV | exfiltration, fichier hostile | 5 MiB, type/signature, Permission, ownership | isolation CPU/temps à prouver |
| Rôles privilégiés | abus de privilège | Permissions atomiques v1 | alias legacy à retirer |
| Administration | accès non autorisé | preuves incomplètes | bloquant |
| Journaux | fuite token, réponse, document ou donnée personnelle | sérialisation V5-A par allowlist, non raccordée | raccord #124 bloquant |
| Routes legacy | réactivation accidentelle ou migration incomplète | flag global désactivé, inventaire vérifié, tests #121 | remplacement et retrait à prouver avant production |
| CI et dépendances | supply-chain | permissions lecture et audit du dépôt dans la CI ; lockfiles présents | audit des dépendances exclu de `security:check` jusqu’à #126 |

## Scénarios prioritaires

1. Automatisation de login/reset/vérification : prise de Compte ou déni de
   service. Les limites par IP/Compte pseudonymisés et 429 sont testées ;
   exiger charge réelle, métriques et validation multi-instance dans #112.
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
7. Réactivation accidentelle d’une route legacy : accès non autorisé. Le flag
   global est `false` et l’inventaire est testé ; exiger matrice
   route/Permission puis retrait après preuve de remplacement.
8. Action GitHub compromise : supply-chain. Refuser toute permission d’écriture
   et `pull_request_target` sans revue de menace dédiée.

## Conditions de sortie

- aucun secret, token, réponse sensible ou document brut dans les logs ;
- rate limits testés sur auth et charges coûteuses ;
- matrice Session/Permission/ownership et tests multi-Compte complets ;
- reprise LifeProject et conflits de version testés après chaque intégration ;
- consentement actif et révocation Guidance testés sans rejeu possible ;
- routes legacy désactivées par défaut et retrait prouvé avant production ;
- vulnérabilités hautes/critiques corrigées ou acceptées formellement ;
- raccord redaction #124 et audits du dépôt exécutés dans la CI du dernier SHA ;
- audit des dépendances, matrice et décisions d’exception livrés par #126.

Limites de cette revue : le helper de redaction n’est pas encore raccordé au
logger runtime (#124) et `security:check` n’exécute pas encore
`security:dependencies` (#126). Cette PR ne constitue donc ni une preuve
d’absence de fuite runtime ni un audit complet des dépendances.

Confiance : élevée sur la présence des contrats V3/V4, du gate legacy #121 et
des limites en mémoire #123 dans `de5a298`, moyenne sur leurs futurs
raccordements V5, faible sur le retrait effectif des surfaces legacy et le
comportement distribué. Une
compilation ou une CI verte ne prouve pas l’absence d’exfiltration ni
l’efficacité opérationnelle.
