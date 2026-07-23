---
status: accepted
---

# MySQL comme source de vérité

MySQL 8 devient la source de vérité commune du web, du futur mobile et de l'administration. Le backend Express y accède avec `mysql2/promise`, des requêtes préparées, des transactions explicites et des migrations versionnées ; Supabase/PostgreSQL et Sequelize sont retirés progressivement après preuve de remplacement de chaque flux, afin d'éviter deux implémentations de persistance concurrentes.

## Consequences

- La base reste sur un réseau interne et aucun port MySQL Orientation Pro n'est publié.
- Les migrations sont testées sur une base isolée avant toute application à des données réelles.
- Les artefacts Supabase ne sont supprimés qu'après validation de la matrice de migration.
