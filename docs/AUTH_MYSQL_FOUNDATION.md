# Fondation Identité, Session et MySQL

Date : 2026-06-20
PRD : GitHub Issue #3

## (1) Executive summary

Un module Identité et Session v1 a été ajouté derrière `/api/v1/auth`, avec access token court, refresh token rotatif haché, révocation serveur et persistance MySQL transactionnelle. La migration montante, le rollback et le cycle HTTP complet ont été testés sur MySQL 8 isolé sans port publié.

Le module est raccordé mais désactivé par défaut. Le frontend utilise encore ses flux historiques ; l'activation reste bloquée par l'absence de configuration SMTP réelle, de rate limiting et de client HTTP web raccordé.

## (2) Inventory avant modification

- Auth historique : comptes en mémoire, mots de passe de démonstration acceptés, JWT 24 h et secret de fallback.
- Frontend : Supabase mocké, token persistant dans `localStorage`, adresse backend codée en dur.
- Persistance : `mysql2` et Sequelize concurrents ; ancien SQL destructif avec Compte admin de démonstration.
- Serveur : CORS acceptant toutes les origines, corps POST/PUT journalisés, ancienne auth montée sans option.
- Aucun service, conteneur ou port Orientation Pro actif.
- MySQL d'autres applications écoutait déjà sur le VPS ; aucune connexion n'a été effectuée vers ces bases.

## (3) Actions appliquées

| Priorité | Action | Type | Risque | Validation requise | Résultat |
|---:|---|---|---|---|---|
| 1 | PRD GitHub Issue #3 et matrice Supabase/MySQL | documentation | faible | validée | publiée |
| 1 | ADR MySQL et Sessions révocables | architecture | faible | validée | ajoutés |
| 1 | Contrat HTTP Identité/Session v1 | non destructive | moyen | validée | ajouté, désactivé par défaut |
| 1 | Store MySQL transactionnel | non destructive | moyen | validée | testé sur MySQL isolé |
| 1 | Migration additive 001 | migration | moyen | validée pour test uniquement | montée et rollback testés |
| 1 | Désactiver l'auth mock par défaut | configuration | moyen | validée | `LEGACY_AUTH_ENABLED=false` |
| 1 | CORS par liste et suppression des logs de corps | sécurité | faible | non | appliqué au serveur non déployé |
| 2 | CI MySQL | CI | faible | non | service éphémère ajouté |

## (4) Backup paths

- Répertoire : `/opt/backups/orientationpro_auth_v1_20260620_033000`
- Permissions : dossier `700`, fichiers `600` après correction.
- Manifeste : `/opt/backups/orientationpro_auth_v1_20260620_033000/SHA256SUMS`.
- Intégrité : six fichiers vérifiés avec `sha256sum -c`, code 0.
- Contenu : serveur, workflow CI, exemples/configurations et manifests npm avant modification.

Restauration fichier par fichier : copier la version sauvegardée vers son chemin d'origine après comparaison. Le commit Git précédent reste le rollback recommandé pour les nouveaux fichiers.

## (5) Tests et vérifications reproduites

- Cycles TDD observés RED puis GREEN pour inscription, compte non vérifié, vérification, connexion, rotation/replay, Session courante, déconnexion, demande et confirmation de reset.
- Tests backend unitaires/HTTP : 19/19 réussis, code 0, dont 9 nouveaux.
- Test MySQL 8 : 2/2 réussis, code 0.
- Rollback : zéro table `auth_*` après descente ; neuf tables après nouvelle montée.
- `npm run check` : code 0.
- Tests frontend : 23/23 réussis.
- TypeScript, ESLint backend et build Vite/PWA : code 0.
- ESLint frontend : 350 avertissements, 0 erreur.
- Scanner de chemins sensibles et `git diff --check` : code 0.
- Smoke serveur auth désactivée : démarrage puis arrêt par `timeout`, code 124 attendu.
- Smoke fail-fast auth activée sans secret valide : code 1 attendu.
- Conteneur MySQL de test : aucun port publié, arrêt propre, suppression automatique confirmée.
- Installation backend : 25 vulnérabilités npm, dont 17 hautes ; non corrigées dans ce lot.

## (6) Rollback steps

1. Ne pas exécuter `migrate:down` sur une base réelle sans dump : ce rollback supprime les données d'identité.
2. Comme le module est désactivé par défaut et aucune base réelle n'a été migrée, le rollback applicatif consiste à revenir au commit précédent ou restaurer les fichiers du répertoire de sauvegarde.
3. Si la migration a seulement été appliquée à une base vide de développement, exécuter `npm run migrate:down`, puis vérifier zéro table `auth_*`.
4. Aucun service VPS ne nécessite redémarrage ou rollback dans ce lot.

## (7) Diff/patchs appliqués

- Nouveau module Identité/Session, store MySQL, adapter SMTP et configuration stricte.
- Migrations `001_auth_foundation.up.sql` et `.down.sql`.
- Tests HTTP et intégration MySQL.
- Scripts de migration et CI MySQL.
- Configuration CORS, logs et activation explicite de l'auth historique/v1.
- Documentation API, base et migration Supabase/MySQL.

## Risques résiduels et prochain slice

- Aucun rate limiting distribué : ne pas activer publiquement l'auth v1.
- SMTP réel non configuré ni testé.
- Le frontend n'utilise pas encore l'interface v1 et conserve des tokens historiques dans `localStorage`.
- Les permissions atomiques sont modélisées mais pas encore peuplées ni appliquées aux autres routes.
- La réponse de récupération ne divulgue pas le Compte par contenu/statut, mais la résistance aux analyses temporelles nécessite une file d'envoi.
- Node 18 du VPS est inférieur à l'exigence de certaines dépendances backend ; la CI utilise Node 20.19.4.
- Sequelize et les artefacts Supabase restent présents hors du slice migré.

Prochain slice recommandé : client HTTP web + raccordement Login/Session/Logout, avec rate limiting serveur et tests navigateur, avant activation de l'interface.
