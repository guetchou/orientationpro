# Remédiation des données sensibles suivies par Git

Date : 2026-06-20

## (1) Executive summary

Le dépôt GitHub `guetchou/orientationpro` est désormais privé. Les trois fichiers d'environnement et les 63 fichiers de CV/upload ont été retirés de toutes les branches Git distantes par réécriture contrôlée de l'historique.

Un clone frais vérifie 0 chemin sensible dans l'historique, 0 objet atteignable correspondant et un scanner applicatif au code 0. Les caches GitHub, copies externes antérieures et secrets éventuellement exposés ne peuvent pas être invalidés par Git seul : la rotation des secrets et, si nécessaire, une demande de purge auprès de GitHub restent requises.

## (2) Inventory avant modification

- Dépôt GitHub initialement public ; 0 fork déclaré au moment de l'opération.
- Branches distantes : `main`, `guetchou-patch-1`, `refactor/platform-web-mobile-foundation` ; aucun tag.
- Fichiers d'environnement suivis : 3.
- Uploads suivis : 63, total 14 220 706 octets.
- Extensions : 36 TXT, 19 PDF, 6 DOCX et 2 sans extension.
- Les noms et contenus des CV ne sont pas reproduits dans ce rapport.
- Aucun service ou conteneur Orientation Pro actif.

## (3) Actions appliquées

| Priorité | Action | Type | Risque | Validation | Résultat |
|---:|---|---|---|---|---|
| 1 | Archiver les `.env`, uploads et références Git | sauvegarde | moyen, archive PII | utilisateur | créée et vérifiée |
| 1 | Passer le dépôt GitHub en privé | configuration externe | moyen | utilisateur | appliqué, visibilité vérifiée |
| 1 | Retirer 66 fichiers de l'index et bloquer leur retour | non destructive pour les fichiers locaux | faible | utilisateur | appliqué |
| 1 | Réécrire une copie miroir avec `git filter-repo` | destructive pour l'historique copié | élevé | utilisateur | 52 commits traités |
| 1 | Mettre à jour chaque branche avec `--force-with-lease` et ancien SHA attendu | destructive pour l'historique distant | élevé | utilisateur | 3/3 branches mises à jour |
| 1 | Réinstaller un clone frais sous `/opt/orientationpro` | remplacement réversible du checkout | moyen | utilisateur | appliqué ; ancien checkout conservé |
| 1 | Restaurer les fichiers privés ignorés avec permissions restreintes | non destructive | faible | utilisateur | 3 fichiers `600`, uploads `700` |

Références réécrites :

- `main` : `0f30f2c5504d2520c8fb89622b6556cbda495354` vers `6427ac9caa958a13a543bc6f79a656b033eaef0a`.
- `guetchou-patch-1` : `7d1291d5173b1bb7ec6e3fdec17f133546da5aa2` vers `423fbd28fa20e98aed8eedfd981adafb2f413989`.
- `refactor/platform-web-mobile-foundation` : `19440cf429de1be72d4b773314ca8638924ec4d5` vers `9bb94717e65d7557aed7867afdb98cc61e99a28a`.

## (4) Backup paths

- Données privées : `/opt/backups/orientationpro_sensitive_20260620_020613/sensitive_worktree.tar.gz`
  - Taille : 13 782 233 octets.
  - SHA-256 : `11add765c7cb261dc03b559d478fcdf94961c17f0f4d31e320758bf9060979f8`.
  - Intégrité : `gzip -t` code 0 ; 67 entrées, aucun chemin absolu ou traversant.
- Historique complet avant réécriture : `/opt/backups/orientationpro_history_rewrite_20260620_021402/pre_rewrite_all_refs.bundle`
  - Taille : 138 720 132 octets.
  - SHA-256 : `307db0b725971e2b408a9839ca4d7ef4d52f850f7614bfd5a25fbfbbb95a08e8`.
  - Intégrité : `git bundle verify` code 0, historique complet.
- Ancien checkout : `/opt/backups/orientationpro_pre_rewrite_worktree_20260620_024700`.
- Rapport avant mise à jour : `/opt/backups/orientationpro_history_rewrite_20260620_021402/backup_20260620_022200_SENSITIVE_DATA_REMEDIATION.md`.
  - SHA-256 : `0dd0f393d9b2349be9b9f5ff22c490bfcd37cfce41f859084c1fcac170ecb639`.

Ces sauvegardes contiennent des données sensibles ou l'ancien historique. Elles doivent rester en permissions `600/700`, hors publication et être transférées vers un stockage chiffré avant toute copie externe.

## (5) Tests et vérifications reproduites

- `git filter-repo` : 52 commits traités.
- Copie réécrite : 0 chemin sensible dans `git log`, 0 objet atteignable correspondant, 3 branches, `git fsck --full` code 0.
- Clone frais GitHub : mêmes trois SHA distants, 0 chemin sensible, 0 objet atteignable, `git fsck --full` code 0.
- `node scripts/check-sensitive-files.cjs` : code 0.
- `npm ci` : code 0 ; 1 516 paquets installés.
- `npm run check` : code 0.
- Tests frontend : 23/23 réussis.
- Tests backend : 10/10 réussis.
- TypeScript, ESLint et build Vite/PWA : code 0 ; ESLint conserve 350 avertissements.
- `npm run test:e2e` : code 0 ; `/`, `/login` et `/tests` validés sur le port éphémère 46691.
- `npm audit` via installation : 68 vulnérabilités, dont 7 critiques ; non corrigées dans ce lot.
- GitHub signale 216 alertes Dependabot sur la branche par défaut ; non corrigées dans ce lot.

Risques résiduels : secrets historiques non encore confirmés comme révoqués, caches GitHub et clones antérieurs hors contrôle, sauvegardes locales non chiffrées, vulnérabilités de dépendances, 350 avertissements ESLint et bundles supérieurs à 500 kB.

## (6) Rollback

Le rollback applicatif du checkout consiste à déplacer le checkout assaini hors de `/opt/orientationpro`, puis remettre `/opt/backups/orientationpro_pre_rewrite_worktree_20260620_024700` à ce chemin. Cette action réintroduit localement l'ancien historique sensible et ne doit pas être publiée.

Le bundle permet de restaurer les anciennes références dans un dépôt isolé avec `git clone <bundle> <dossier>`. Restaurer ces références sur GitHub republierait les données sensibles et exige une nouvelle validation explicite ; ce n'est pas un rollback sûr pour le dépôt distant.

Les fichiers privés peuvent être restaurés dans un dossier isolé après vérification du SHA-256 : `mkdir -m 700 <dossier> && tar -xzf <archive> -C <dossier>`. Ne jamais les ajouter à Git.

## (7) Diff/patchs appliqués

- Retrait historique : `.env`, `.env.demo`, `backend/.env`, `backend/uploads/**`.
- Ajouts : `.env.example`, `.env.demo.example`, `scripts/check-sensitive-files.cjs`.
- Modifications : `.gitignore`, `package.json`, workflow CI et documentation.
- Aucune valeur secrète ni contenu de CV ajouté au diff.

## Suivi obligatoire

1. Faire tourner tous les secrets ayant pu apparaître dans les anciens `.env`.
2. Vérifier les journaux d'accès et usages anormaux des fournisseurs concernés.
3. Contacter GitHub Support si la suppression des vues mises en cache ou des objets associés est requise.
4. Placer les sauvegardes sensibles dans un stockage chiffré avec politique de conservation, puis supprimer les copies temporaires uniquement après validation explicite.
