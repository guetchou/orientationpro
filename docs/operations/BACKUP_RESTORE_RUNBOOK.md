# Sauvegarde et restauration MySQL

Les scripts exigent un conteneur explicitement nommé, une base au nom validé,
un fichier nouveau et un checksum SHA-256. Ils récupèrent le secret depuis
l'environnement interne du conteneur sans l'afficher.

```bash
scripts/release/mysql-backup.sh \
  --container CONTAINER \
  --database DATABASE \
  --output /chemin/protege/backup.sql
```

La restauration refuse de démarrer sans checksum et confirmation d'une cible
jetable. Une restauration de production requiert une procédure distincte,
coordonnée et approuvée ; ne pas contourner cette protection.

Test reproductible :

```bash
scripts/release/test-mysql-backup-restore.sh
```

Ce test démarre MySQL 8 sans port, écrit deux lignes, sauvegarde, détruit
uniquement la base jetable, restaure et compare nombre, identifiants et valeurs.
