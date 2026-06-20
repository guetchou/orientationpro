# Base de données MySQL

## Décision

MySQL 8 est la source de vérité cible. L'accès se fait avec `mysql2/promise`; Sequelize reste présent uniquement dans des modules historiques qui n'ont pas encore été migrés.

## Migration 001 — fondation d'identité

Tables créées :

- `auth_accounts`
- `auth_roles`
- `auth_permissions`
- `auth_role_permissions`
- `auth_account_roles`
- `auth_email_verification_tokens`
- `auth_password_reset_tokens`
- `auth_sessions`
- `auth_refresh_tokens`

La migration montante est additive et n'insère aucun Compte. Elle initialise uniquement les sept Rôles canoniques.

## Commandes

Depuis `backend`, avec les variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` :

```bash
npm run migrate:up
npm run migrate:down
```

Le rollback `001_auth_foundation.down.sql` supprime les neuf tables d'identité. Il détruit les Comptes et Sessions présents dans ces tables : il ne doit jamais être exécuté sur une base contenant des données sans dump et validation explicite.

## Preuve isolée

Le test `npm run test:mysql` utilise une base MySQL 8 dédiée. Il vérifie le cycle HTTP complet, exécute le rollback, confirme zéro table `auth_*`, puis réapplique la migration et confirme neuf tables.

## Contraintes d'exploitation

- aucun port MySQL Orientation Pro publié ;
- migrations appliquées par commande contrôlée, jamais au démarrage du serveur ;
- secrets obligatoires, sans fallback ;
- sauvegarde logique et procédure de restauration requises avant toute migration de données réelles.
