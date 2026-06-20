# Remédiation des données sensibles suivies par Git

Date : 2026-06-20

## (1) Executive summary

La version courante ne suit plus les trois fichiers d'environnement ni les 63 fichiers de CV/upload. Les fichiers restent sur le VPS avec permissions restreintes et une archive de restauration vérifiée. Un contrôle intégré à `npm run check` bloque leur réintroduction.

Le dépôt GitHub `guetchou/orientationpro` est public. Les fichiers restent accessibles dans l'historique du commit de base tant que l'historique distant n'est pas réécrit ou traité avec GitHub. Cette étape n'a pas été exécutée car les règles du projet interdisent `git push --force`.

## (2) Inventory avant modification

- Dépôt GitHub : public.
- Fichiers d'environnement suivis : 3.
- Uploads suivis : 63, total 14 220 706 octets.
- Extensions : 36 TXT, 19 PDF, 6 DOCX et 2 sans extension.
- Les noms et contenus des CV ne sont pas reproduits dans ce rapport.
- Permissions initiales : fichiers `755`, dossier uploads `755`, bundle initial `644`.
- Aucun service ou conteneur Orientation Pro actif.

## (3) Actions appliquées

| Priorité | Action | Type | Risque | Validation | Résultat |
|---:|---|---|---|---|---|
| 1 | Archive locale des `.env` et uploads | sauvegarde | moyen, archive PII | validée | créée et vérifiée |
| 1 | Restreindre fichiers/archives à `600`, dossiers à `700` | non destructive | faible | validée | appliquée |
| 1 | Retirer 66 fichiers de l'index avec `git rm --cached` | destructive pour l'index | moyen | utilisateur | appliquée, fichiers locaux conservés |
| 1 | Ajouter `.env.example` et `.env.demo.example` sans Supabase | non destructive | faible | non | appliquée |
| 1 | Ignorer futurs `.env`, uploads et clés privées | non destructive | faible | non | appliquée |
| 1 | Ajouter `check:sensitive` à la CI | non destructive | faible | non | appliquée |
| 1 | Réécrire l'historique distant | destructive | élevé | conflit avec interdiction force-push | non exécutée |

## (4) Backup paths

- Archive : `/opt/backups/orientationpro_sensitive_20260620_020613/sensitive_worktree.tar.gz`
- Taille : 13 782 233 octets.
- SHA-256 : `11add765c7cb261dc03b559d478fcdf94961c17f0f4d31e320758bf9060979f8`.
- Permissions : archive `600`, dossier `700`, propriétaire `root:root`.
- Intégrité : `gzip -t` code 0 ; 67 entrées d'archive.
- Restauration isolée : `mkdir -m 700 /tmp/orientationpro-sensitive-restore && tar -xzf <archive> -C /tmp/orientationpro-sensitive-restore`.

L'archive n'est pas chiffrée : aucune clé publique ni destination de coffre n'a été fournie. Elle est protégée uniquement par les permissions Unix. Un transfert vers un stockage chiffré reste requis avant toute sauvegarde externe.

## (5) Tests et vérifications

- Contrôle avant retrait : échec attendu, 3 environnements et 63 uploads suivis.
- Contrôle après retrait : `Sensitive tracked-path check passed`.
- Fichiers suivis après retrait : 0 environnement, 0 upload.
- Fichiers locaux après retrait : 3 environnements, 63 uploads.
- `npm run check` : code 0.
- Tests frontend : 23/23.
- Tests backend : 10/10.
- TypeScript et build Vite/PWA : code 0.
- Aucun port ou service Orientation Pro créé.

Risque résiduel : critique tant que le dépôt reste public avec l'ancien historique. Le retrait de la version courante empêche les futurs clones de branche nettoyée d'exposer ces fichiers au HEAD, mais n'efface pas les objets Git antérieurs.

## (6) Rollback

Les fichiers locaux ne nécessitent aucun rollback : ils n'ont pas été supprimés. Pour restaurer une copie isolée, utiliser l'archive ci-dessus puis vérifier son checksum avant extraction.

Ne pas utiliser `git revert` sur le commit de remédiation sans filtrer les chemins sensibles : cela les réintroduirait dans la version courante. En cas de problème applicatif, restaurer uniquement les fichiers localement depuis l'archive, avec permissions `600/700`, sans `git add`.

## (7) Diff appliqué

- Retrait de l'index : 3 fichiers d'environnement et 63 uploads.
- Ajouts : `.env.example`, `.env.demo.example`, `scripts/check-sensitive-files.cjs`.
- Modifications : `.gitignore`, `package.json`, documentation.
- Aucune valeur secrète ni contenu de CV ajouté au diff.

## Étape historique non exécutée

Une purge complète exige normalement : rendre immédiatement le dépôt privé, révoquer/faire tourner tout secret potentiellement exposé, réécrire toutes les références avec `git filter-repo`, coordonner les clones, pousser les références réécrites avec une opération forcée contrôlée, puis demander à GitHub de purger les vues/caches concernées.

Cette procédure nécessite une dérogation écrite à l'interdiction de force-push, une fenêtre de maintenance Git et l'accord du propriétaire du dépôt. Sans ces éléments, ce rapport ne qualifie pas l'historique de purgé.
