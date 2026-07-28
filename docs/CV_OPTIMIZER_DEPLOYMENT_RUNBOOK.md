# Runbook — Activation du CV Optimizer V1 en production (C)

> **Ce lot n'exécute AUCUNE mutation de production.** Ce runbook est la procédure
> à exécuter séparément, après revue, sur autorisation explicite. Il ne doit rien
> déclencher automatiquement.

Cible : `vps-ovh` (hostname `vps-0e8f1563`), projet Compose `orientationpro_riasec`.
Conteneurs : `orientationpro_riasec-web-1`, `-api-1`, `-db-1`.
Interdits absolus : ne pas recréer `db`, ne pas relancer seed RIASEC / import O*NET,
ne pas modifier les 60 items ni les 1016 métiers, ne pas `docker system prune`,
ne supprimer aucun volume.

## 0. Préalables et sauvegardes

```bash
# hostname
ssh vps-ovh 'hostname'   # attendu: vps-0e8f1563

# dump MySQL cohérent (aucun mot de passe en clair dans la commande visible)
STAMP=$(date -u +%Y%m%dT%H%M%SZ); BK=/opt/backups/cv-activation-$STAMP; mkdir -p "$BK"
ssh vps-ovh "docker exec orientationpro_riasec-db-1 bash -c 'mysqldump --single-transaction --quick --triggers --routines --events --hex-blob -uroot -p\"\$MYSQL_ROOT_PASSWORD\" orientationpro' | gzip -c > $BK/db-before.sql.gz"
ssh vps-ovh "sha256sum $BK/db-before.sql.gz | tee $BK/db-before.sql.gz.sha256; gzip -t $BK/db-before.sql.gz && echo OK"

# tags de rollback des images actuelles
ssh vps-ovh 'docker image tag orientationpro_riasec-api:latest orientationpro_riasec-api:rollback-'"$STAMP"
ssh vps-ovh 'docker image tag orientationpro_riasec-web:latest orientationpro_riasec-web:rollback-'"$STAMP"

# sauvegarde Compose + Nginx
ssh vps-ovh "cp /opt/orientationpro/.vps/docker-compose.yml $BK/ ; cp /etc/nginx/sites-available/makoki.org $BK/ 2>/dev/null || true"
```

## 1. Migration 005 — validée sur clone AVANT la production

```bash
# restaurer le dump dans un MySQL 8 jetable (tmpfs, sans volume persistant)
ssh vps-ovh 'docker run -d --name cv-clone-'"$STAMP"' -p 127.0.0.1:33097:3306 --tmpfs /var/lib/mysql -e MYSQL_ROOT_PASSWORD=$(openssl rand -hex 24) mysql:8.0'
# attendre l'authentification réelle (SELECT 1), puis restaurer db-before.sql.gz
# exécuter le cycle de migration fourni par le dépôt :
ssh vps-ovh 'cd /opt/worktrees/... && node backend/scripts/verify-cv-migration-cycle.js'   # up -> structure -> down -> re-up
# critères : migration 005 applique cv_analyses + permissions, rollback complet, réapplication OK,
#            migrations 001-004 inchangées, aucun impact RIASEC/O*NET.
# détruire le clone (données en RAM) : docker rm -f cv-clone-<STAMP>
```

Puis, **seulement si le clone est vert**, appliquer 005 en production :

```bash
# via le service quality/one-shot du Compose ou le runner de migration, en ciblant la prod
ssh vps-ovh 'cd /opt/orientationpro/.vps && docker compose --env-file /opt/orientationpro/.env.vps run --rm api node scripts/migrate.js up'
# vérifier : table cv_analyses présente, 4 permissions cv.* insérées, schema_migrations = 005 ajoutée
```

## 2. Déploiement API (flag encore désactivé)

```bash
cd /opt/orientationpro/.vps
docker compose --env-file /opt/orientationpro/.env.vps build api
# recréer UNIQUEMENT l'api, sans toucher db :
docker compose --env-file /opt/orientationpro/.env.vps up -d --no-deps --force-recreate api
# canari : /api/test/health = 200 ; RestartCount = 0
```

## 3. Vérifier le comportement AVEC le flag désactivé

```bash
# CV_API_V1_ENABLED absent/false => les routes v1 doivent répondre 404
curl -s -o /dev/null -w '%{http_code}\n' https://makoki.org/api/v1/cv/analyses   # attendu: 404
# côté produit : /cv-optimizer affiche l'état honnête « service non encore activé »
```

## 4. Activer CV_API_V1_ENABLED

```bash
# ajouter CV_API_V1_ENABLED=true dans /opt/orientationpro/.env.vps (AUTH_V1_ENABLED doit déjà être true)
docker compose --env-file /opt/orientationpro/.env.vps up -d --no-deps --force-recreate api
```

## 5. Déploiement web (si nécessaire)

```bash
docker compose --env-file /opt/orientationpro/.env.vps build web
docker compose --env-file /opt/orientationpro/.env.vps up -d --no-deps --force-recreate web
```

## 6. Smoke tests authentifiés

- `POST /api/v1/cv/analyses` sans token → 401.
- Avec un compte de test : upload PDF texte → 201 + `snapshot.scores` complet.
- `GET /api/v1/cv/analyses` → liste paginée du compte.
- `GET /api/v1/cv/analyses/:id/report.pdf` → PDF (en-tête `%PDF-`).
- Compte B lit l'analyse de A → **404** (non-énumération).
- UI : `/cv-optimizer` (protégé) → parcours upload→résultat, scores aux maxima réels ;
  `/cv-history` → historique, détail, suppression.
- Mobile 390×844 : aucun débordement horizontal.

## 7. Contrôle des journaux

```bash
docker logs --tail 200 orientationpro_riasec-api-1 | grep -iE 'error|unhandled|denied' | tail
# vérifier l'ABSENCE de contenu de CV / PII dans les logs.
```

## 8. Critères de succès

- HTTP publics 200/401/404 attendus, **aucun 500/502/504**.
- `RestartCount = 0` sur api et web ; IDs `db` inchangés.
- Compteurs RIASEC (60 items) et O*NET (1016 métiers, 923 directs) **inchangés**.
- Isolation A/B vérifiée.

## 9. Rollback (quand il est réellement sûr)

- **Flag** : retirer `CV_API_V1_ENABLED` (repasser à false) + `up -d --no-deps --force-recreate api`.
  Les routes v1 repassent en 404 ; le reste du produit est intact. Réversible immédiat.
- **Application** : repointer sur les images taguées `:rollback-<STAMP>` puis
  `up -d --no-deps --force-recreate api` (et web si recréé).
- **Migration 005** : `docker compose run --rm api node scripts/migrate.js down` — à n'exécuter
  que si aucune analyse de valeur n'a été créée, et **jamais** au prix d'une modification
  RIASEC/O*NET. En cas de doute, préférer le rollback du flag (sûr) et conserver la table.

## Notes

- Le flag `CV_API_V1_ENABLED` est **off par défaut** : la fusion du code n'active rien.
- Ne jamais afficher de secret ni de mot de passe dans les commandes ou les journaux.
- Aucune étape de ce runbook n'a été exécutée dans le lot A+B.
