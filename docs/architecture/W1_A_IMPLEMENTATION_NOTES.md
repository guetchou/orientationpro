# Notes d’implémentation W1-A

- Numéro de migration réservé : `011_life_projects`.
- Moteur de stockage : InnoDB.
- Identifiants fonctionnels : chaînes ASCII stables jusqu’à 128 caractères ; le compte propriétaire conserve le format `CHAR(36) ascii_bin` existant.
- Relations structurantes : clés étrangères composites pour empêcher qu’un scénario, un plan ou une action soit rattaché à un autre projet.
- Sélection active : table relationnelle dédiée, sans cycle de clés étrangères.
- Concurrence : `lock_version` et lecture verrouillée du projet avant écriture.
- Historique : ordre unique par projet et contrôle applicatif du préfixe append-only.
- JSON : réservé aux listes, provenance et incertitude ; les relations navigables sont normalisées.
- Suppression fonctionnelle : non exposée dans W1-A ; la cascade ne s’applique qu’à la suppression du compte propriétaire ou aux opérations internes de remplacement transactionnel.
