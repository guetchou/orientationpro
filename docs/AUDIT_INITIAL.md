# Audit initial — Orientation Pro Congo

Date de l'audit : 2026-06-19 (Africa/Brazzaville)  
Périmètre : VPS `vps-0e8f1563`, dépôt `/opt/orientationpro`, commit de base `0f30f2c`  
Branche : `refactor/platform-web-mobile-foundation`

## PRD du lot initial

### Objectif

Établir l'état réel du VPS et du dépôt, vérifier la reproductibilité minimale du web et des tests, identifier les risques bloquants et préparer une migration progressive vers une API TypeScript et MySQL commune au web et au futur mobile. Ce lot ne restructure pas le projet, ne déploie rien et ne démarre aucun service Orientation Pro.

### Contraintes et critères d'acceptation

- Le projet réside uniquement sur le VPS dans `/opt/orientationpro`.
- Aucune modification n'est faite sur `main`.
- Les autres applications, conteneurs, ports et reverse proxies restent inchangés.
- Les résultats build/typecheck/lint/tests sont rapportés avec leurs codes réels.
- Supabase n'est pas retenu dans l'architecture cible : son auth, son stockage, son Realtime, ses Edge Functions, son schéma PostgreSQL et ses politiques RLS doivent être inventoriés puis remplacés explicitement, sans suppression immédiate.
- La cible de données est MySQL, accessible uniquement par l'API sur un réseau interne ; la base ne doit pas être exposée publiquement.

## (1) Executive summary

Le web produit un build Vite avec code 0 et `tsc --noEmit` termine avec code 0. L'état n'est toutefois pas stabilisé : ESLint échoue avec 359 erreurs et 46 avertissements, Vitest n'exécute aucun test faute de `jsdom`, les scripts normalisés demandés sont absents et les dépendances de production racine comptent 51 vulnérabilités connues, dont 5 critiques.

Le risque prioritaire est la confidentialité : 63 fichiers d'upload sont suivis par Git, dont des CV nominatifs, tandis que `GET /api/cv/history` peut retourner tous les enregistrements sans authentification lorsque les filtres sont omis et `GET /api/cv/analysis/:id` ne vérifie ni session ni propriétaire. La route React `/cv-history` est également publique, bien que sa page actuelle soit un placeholder. Ces constats correspondent à OWASP A01:2025 (Broken Access Control/IDOR).

La décision cible est MySQL, mais le dépôt mélange actuellement un backend Express/MySQL, des artefacts Supabase/PostgreSQL, un client Supabase mocké et des fichiers SQL incompatibles entre moteurs. Une migration directe ou une suppression de Supabase serait risquée avant d'avoir défini les contrats API, l'authentification, le stockage privé et une cartographie de données.

## (2) Inventory — État avant modification

### VPS et permissions

| Élément | État observé |
|---|---|
| Hôte / utilisateur | `vps-0e8f1563` / `root` |
| OS | Ubuntu, noyau `6.8.0-110-generic`, x86_64 |
| Disque racine | 193 GiB, 156 GiB utilisés, 38 GiB disponibles, 81 % |
| Mémoire | 22 GiB, 13 GiB disponibles ; aucun swap |
| Node / npm | `v18.20.8` / `10.8.2` |
| pnpm | absent globalement ; `packageManager` déclare pnpm 10.18.3 mais aucun `pnpm-lock.yaml` n'existe |
| Git | `2.43.0` |
| Docker / Compose | `29.3.0` / `v5.1.0` |
| Permissions projet | `/opt/orientationpro` et `.git` : `root:root`, lecture/écriture disponibles pour l'utilisateur d'audit |
| Permissions manquantes | aucune pour ce lot |

### Services, conteneurs et ports

- Nginx et Docker sont actifs. Redis est actif localement. Apache, Caddy et Traefik systemd sont inactifs ; un conteneur Traefik est utilisé par un autre projet.
- 14 projets Docker Compose et plus de 40 conteneurs préexistants ont été observés. Plusieurs conteneurs `talatala` redémarraient déjà ; aucun changement n'a été effectué.
- Nginx occupe 80/443. Des applications utilisent notamment 1188, 1199, 1200, 1300, 1310, 1311, 1337, 1400, 1401, 1410, 1500, 1501, 3011, 3336, 3337, 4000, 4100, 4101, 5173, 5210, 5433, 55432, 55433, 56379, 56380, 59000 et 59001.
- Risque transversal hors périmètre : MySQL écoute sur `0.0.0.0:3306` et PostgreSQL sur `0.0.0.0:5432`. Leur appartenance à d'autres applications interdit toute correction sans audit et validation dédiés.
- Aucun service/conteneur Orientation Pro n'était actif. `docker compose config --quiet` valide le Compose avec un avertissement sur l'attribut `version` obsolète.

### Git et structure

- `/opt/orientationpro` était absent ; le dépôt officiel a été cloné sans écraser de contenu.
- Remote : `https://github.com/guetchou/orientationpro.git`.
- `main` était propre et alignée sur `origin/main` au commit unique visible `0f30f2c` (`Backup rescue - 20260108`).
- Branche créée avant modification : `refactor/platform-web-mobile-foundation`.
- Structure actuelle : frontend Vite dans `src` (511 fichiers), backend mixte dans `backend/src` (68 fichiers), 22 fichiers Edge Functions, une migration Supabase, 38 fichiers publics, 3 workflows CI et 14 fichiers de tests.
- Les fichiers `.env`, `.env.demo`, `backend/.env` et `backend/.env.example` sont suivis par Git. Les valeurs n'ont pas été affichées dans ce rapport. Elles paraissent locales/de démonstration, mais doivent être considérées compromises tant qu'une revue et une rotation n'ont pas démontré le contraire.
- `backend/uploads` contient 63 fichiers suivis, dont des CV nominatifs PDF/DOCX. Leur contenu n'a pas été reproduit.
- Les installations n'ont modifié aucun lockfile : les SHA-256 de `package-lock.json` et `backend/package-lock.json` sont restés respectivement `392bb11e...aeb4` et `54beaca0...5dd`.

### Scripts disponibles

Racine : `dev`, `build`, `build:dev`, `lint`, `preview`.  
Backend : `start`, `dev`, et un `test` qui échoue volontairement avec « no test specified ».

Absents : `typecheck`, `test`, `test:watch`, `test:coverage`, `test:e2e`, `check`. Le dépôt déclare pnpm tout en n'offrant qu'un lockfile npm : l'installation verrouillée actuelle est donc `npm ci`, pas `pnpm install --frozen-lockfile`.

## Comparaison avec des pratiques industrielles similaires

| Capacité | Pratique de référence | État constaté | Écart |
|---|---|---|---|
| Données privées/CV | Contrôle d'accès côté serveur, deny-by-default, contrôle du propriétaire de chaque objet | Contrôle principalement React ; historique et analyse CV non protégés dans l'API | Critique |
| Upload de CV | Liste blanche d'extensions, signature réelle, taille, nom généré, auth, stockage hors webroot, analyse antimalware | Multer sans limite/type/filtre, nom original conservé, aucune auth | Critique |
| Orientation RIASEC | Questionnaire, scoring, interprétation, fiabilité et validité documentés ; O*NET publie un manuel et un modèle de résultats | Plusieurs tests existent, mais aucune preuve méthodologique complète n'a été validée dans ce lot | Élevé |
| Web/mobile | API versionnée commune, contrats et validation partagés, auth centralisée, cache privé contrôlé | Frontend lié à des mocks/Supabase et backend Express séparé ; mobile absent | Élevé |
| CI | Les contrôles échoués bloquent la fusion | Lint et tests sont neutralisés par `|| echo`; workflow de déploiement automatique destructif sur `main` | Critique |
| Base commune | Base privée, migrations versionnées, contraintes/index, sauvegarde/restauration testées | MySQL Compose existe, mais aucun historique cohérent de migrations MySQL ; SQL PostgreSQL/Supabase parallèle | Élevé |

Références :

- OWASP Top 10 2025 A01, contrôles d'accès côté serveur : https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/
- OWASP File Upload Cheat Sheet : https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- O*NET Interest Profiler Manual (RIASEC, scoring, fiabilité, validité) : https://www.onetcenter.org/reports/IP_Manual.html

## Audit des cinq modules prioritaires

| Module | Score risque sécurité (1 faible, 10 critique) | Dépendances/flux critiques | Couverture constatée |
|---|---:|---|---|
| `backend/src` | 10 | Express, JWT, MySQL2, Sequelize, Multer, PDF parsers ; CV/auth/jobs | Aucun test backend exécutable ; syntaxe JS vérifiée |
| `src/components/auth` + `src/hooks/auth` | 9 | session locale/mocks, rôle lu côté client, gardes React | Aucun test d'autorisation exécuté |
| `src/router` + `src/pages` | 9 | routes privées/publiques, doublon `/recrutement`/`/recruitment`, placeholders | Tests Vitest bloqués ; route CV publique prouvée |
| `src/integrations`, `src/lib`, `supabase` | 8 | Supabase mocké, 22 Edge Functions, migration PostgreSQL/RLS | Aucun test RLS ; migration non appliquée |
| `public` + PWA/analytics | 7 | service worker généré, cache assets, RouteTracker | Build PWA réussi ; aucun test offline/cache privé/E2E |

### Constats OWASP Top 10:2025

- **A01 Broken Access Control — critique** : historique CV sans auth, analyse par ID sans ownership, CORS accepte toute origine, rôles surtout côté client.
- **A02 Security Misconfiguration — critique** : `.env` suivis, comptes/mots de passe de test renvoyés par la route racine, erreurs/logs verbeux, MySQL Compose avec mots de passe faibles de développement.
- **A03 Software Supply Chain Failures — critique** : audit racine complet 67 vulnérabilités (6 critiques) ; dépendances de production racine 51 (5 critiques) ; backend 25 (17 élevées).
- **A04 Cryptographic Failures — élevé** : fallback JWT codé et absence de preuve sur rotation, chiffrement des sauvegardes et stockage privé.
- **A05 Injection — moyen/élevé** : les requêtes CV observées utilisent des paramètres préparés, mais l'audit exhaustif des requêtes dynamiques n'est pas terminé.
- **A06 Insecure Design — élevé** : plusieurs backends/modèles concurrents, mocks présentés comme fonctionnalités, absence de contrats et de modèle d'autorisation central.
- **A07 Authentication Failures — critique** : authentification absente de routes sensibles et secrets/fallbacks faibles.
- **A08 Software or Data Integrity Failures — élevé** : CI masque les échecs et pousse automatiquement des modifications ; aucun contrôle de provenance des fichiers.
- **A09 Security Logging and Alerting Failures — élevé** : body POST/PUT presque complet journalisé, ce qui peut exposer des données personnelles ; aucune politique de rétention/alerte démontrée.
- **A10 Mishandling of Exceptional Conditions — moyen** : erreurs de développement et stack potentiellement journalisées ; aucun test de panne/rollback.

## Base de données et décision MySQL

La seule migration Supabase crée 22 tables PostgreSQL, des index, triggers et quelques politiques RLS. Elle n'est pas directement portable : elle dépend notamment de `public`, `auth.users`, UUID, tableaux PostgreSQL, fonctions/triggers PL/pgSQL et RLS. Le backend Express utilise déjà `mysql2` et des placeholders préparés, tandis que le Compose définit MySQL 8.0. Des scripts SQL MySQL existent dans `backend/src/db`, mais il n'existe pas encore de chaîne de migrations versionnée démontrée.

Décision : conserver les artefacts Supabase en lecture seule comme source d'inventaire jusqu'à migration vérifiée. La cible sera MySQL derrière une API TypeScript unique. Le remplacement doit fournir explicitement : sessions/refresh/révocation, RBAC et ownership côté API, stockage privé des CV avec URL temporaire, notifications/temps réel si requis, migrations MySQL, audit logs, sauvegarde/restauration et tests de parité. Supprimer Supabase avant ces branchements créerait une dette de flux.

## (3) Actions proposées — priorité et risque

| Priorité | Action | Type | Risque | Validation requise ? | Exécution immédiate ? | Alternative non-invasive |
|---:|---|---|---|---|---|---|
| 1 | Mettre en quarantaine logique les routes CV : auth obligatoire, ownership, réponses minimales, limites upload | non-destructive | moyen : changement de comportement nécessaire | non pour correctif sur branche ; oui avant déploiement | prochain lot, avec tests | désactiver les routes au reverse proxy si une instance active est découverte |
| 1 | Traiter les CV et `.env` suivis : inventaire légal, rotation, retrait de l'index puis nettoyage d'historique coordonné | destructive pour l'historique Git | élevé | oui, propriétaire données + dépôt | non | rendre le dépôt privé/restreindre les accès immédiatement sans réécrire l'historique |
| 1 | Neutraliser le déploiement automatique destructif et rendre lint/tests bloquants | non-destructive | faible | non sur branche ; revue PR requise | prochain lot | désactiver le workflow dans GitHub avec validation propriétaire |
| 1 | Définir l'ADR MySQL et la matrice de migration Supabase → API/MySQL | documentation/audit | faible | non | oui | aucune |
| 2 | Normaliser Node 20+, pnpm, lockfile et scripts `check` | non-destructive | moyen : résolution des dépendances peut changer | non sur branche | après sauvegarde et baseline | conserver npm temporairement et documenter l'écart |
| 2 | Réparer la configuration Vitest (`jsdom`) et créer tests auth/CV/RBAC | non-destructive | faible | non | après lot sécurité | tests API manuels temporaires, insuffisants seuls |
| 2 | Créer migrations MySQL versionnées et tests de migration/rollback sans données de production | non-destructive en environnement isolé | moyen | validation DBA avant production | après modèle validé | schéma SQL documenté sans application |
| 3 | Introduire workspace et packages partagés, puis Expo | non-destructive mais large | moyen/élevé | revue architecture | non avant stabilisation | conserver la structure actuelle pendant la stabilisation |
| 4 | Auditer l'exposition VPS de 3306/5432 | audit puis infrastructure potentiellement risquée | élevé si correction globale | oui, propriétaires des services | audit oui ; modification non | documenter et isoler seulement Orientation Pro |

## Plan d'intervention ordonné

1. **Lot sécurité immédiate** : tests de non-accès, middleware auth/RBAC/ownership, sécurisation upload, suppression des comptes de test exposés et logs de body.
2. **Lot secrets et données personnelles** : confirmer le statut public/privé du dépôt, contacter le responsable des données, rotation, procédure approuvée de purge des CV de Git et conservation légale.
3. **Lot qualité/CI** : Node 20 LTS, gestionnaire unique, scripts standardisés, `jsdom`, tests déterministes, CI bloquante sans déploiement.
4. **Lot architecture MySQL** : ADR, schéma canonique, migrations et rollback, auth centralisée, stockage objet privé, client API commun ; tests de parité avec les flux Supabase existants.
5. **Lot monorepo progressif** : packages types/validation/domain/api-client, déplacement web par tranches avec build/tests à chaque étape.
6. **Lot mobile Expo** : fondation navigation/auth/API/cache faible réseau, puis vertical slices tests, CV, offres, rendez-vous et notifications.
7. **Lot staging VPS** : ports dédiés après nouvel inventaire, réseau Docker interne, health checks, logs rotatifs, backup/restore testé ; aucune production automatique.

## (4) Backup paths — Sauvegardes effectuées

- Bundle : `/opt/backups/orientationpro_initial_20260619_202259.bundle`
- Taille : 138 733 239 octets
- SHA-256 : `f8b59b4d80c3f3b1c93eb0e98742223afe739a9dd60fc243082dd2a1b02bf7c4`
- Date UTC : `2026-06-19 20:23:00`
- Permissions : `-rw-r--r-- root:root`
- Vérification : `git bundle create` code 0 et checksum calculé.
- Restauration isolée : `git clone /opt/backups/orientationpro_initial_20260619_202259.bundle /opt/orientationpro-restored`

Le bundle contient l'historique suivi, donc également les fichiers sensibles déjà versionnés. Son accès doit rester limité ; le chiffrement et une restauration complète n'ont pas été testés dans ce lot. Aucun dump de base Orientation Pro n'a été créé : aucune base ou instance active appartenant au projet n'a été identifiée.

## (5) Tests et vérifications reproduites

| Commande | Résultat |
|---|---|
| `npm ci --ignore-scripts` | code 0, 1 455 paquets installés ; 67 vulnérabilités totales |
| `npm run build` | code 0, 3 923 modules transformés, PWA générée, avertissement chunk vendor 709,43 kB |
| `npx tsc --noEmit` | code 0 |
| `npm run lint` | code 1, 359 erreurs et 46 avertissements |
| `npx vitest run` | code 1, `jsdom` absent, 3 erreurs, aucun test exécuté |
| `backend/npm ci --ignore-scripts` | code 0, 355 paquets ; 25 vulnérabilités, dont 17 élevées |
| `node --check` sur les `.js` backend | code 0 |
| `docker compose config --quiet` | code 0, avertissement `version` obsolète |
| contrôles Git/checksums | branche correcte, lockfiles inchangés, seul le présent rapport est attendu dans le diff final |

Smoke checks non exécutés : aucune instance Orientation Pro ni base dédiée n'a été démarrée, afin de ne réserver aucun port et de ne pas affecter le VPS partagé. Aucun test E2E, mobile, API avec base, RLS, restauration, responsive ou screenshot UI n'était disponible/exécutable dans ce lot.

Risque résiduel estimé : **85 % de probabilité de défaut important sur un flux complet avant stabilisation**, avec impacts possibles sur confidentialité des CV, autorisations, CI et reproductibilité. Cette estimation est qualitative, fondée sur l'absence de tests exécutables et les vulnérabilités prouvées ; elle ne mesure pas une probabilité d'incident en production.

## (6) Rollback steps

Le lot n'a modifié ni service, ni port, ni base, ni configuration système. Pour annuler le seul fichier ajouté après commit éventuel :

```bash
cd /opt/orientationpro
git revert <hash-du-commit-audit>
```

Pour reconstruire une copie indépendante de l'état initial :

```bash
git clone /opt/backups/orientationpro_initial_20260619_202259.bundle /opt/orientationpro-restored
```

Ne pas remplacer `/opt/orientationpro` par cette copie sans validation : cela pourrait écraser des travaux ultérieurs. Aucun rollback DB n'est nécessaire.

## (7) Diff/patchs appliqués

- Ajout uniquement : `docs/AUDIT_INITIAL.md`.
- Branche créée : `refactor/platform-web-mobile-foundation`.
- Aucune migration, suppression, modification de `.env`, dépendance déclarée, service ou reverse proxy.
- Diff vérifiable : `git diff -- docs/AUDIT_INITIAL.md`.

## Incertitudes et données manquantes

- Le dépôt GitHub est-il public ou privé, et qui est responsable du traitement des CV déjà versionnés ?
- Les valeurs suivies dans `.env` ont-elles déjà servi ailleurs que localement ? Une rotation est requise tant que ce point n'est pas démontré.
- Aucune base Orientation Pro active n'a été trouvée ; les données réellement utilisées et leur éventuelle localisation externe restent inconnues.
- Aucun contrat API canonique, matrice RBAC approuvée, politique de conservation ou propriétaire fonctionnel des tests psychométriques n'est documenté de façon vérifiable.
- La restauration du bundle et les sauvegardes chiffrées restent à tester.

Ces inconnues bloquent toute migration de données, purge d'historique Git, exposition réseau ou annonce de sécurité/production.
