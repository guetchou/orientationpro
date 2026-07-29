# Registre des risques V5-A

Observation : 2026-07-29. V3-A/B (#101, #104) sont fusionnés. Révision obligatoire après
fusion des lots V3 restants et de la Vague 4.

| ID | Fait ou inconnue | Gravité | Décision | Clôture |
|---|---|---:|---|---|
| SEC-001 | Routes legacy sensibles non gardées | critique | bloquant, non accepté | flag OFF, authz, matrice et tests |
| SEC-002 | Aucun rate limiting central | haute | bloquant | limites auth/upload testées |
| SEC-003 | Logs directs, redaction non raccordée | critique | bloquant | logger structuré et tests canaris |
| SEC-004 | Alias legacy `superadmin` | haute | tolérance préparatoire | migration vers `super_admin` |
| SEC-005 | Identifiants de démo dans scripts legacy | critique | bloquant | retrait, rotation et scan historique |
| SEC-006 | Isolation parseur document non prouvée | haute | bloquant avant public | limites CPU/temps/mémoire |
| SEC-007 | V3 partielle et V4 absente | critique | dépendance externe | fusion puis audit différentiel |
| SEC-008 | Vulnérabilités de dépendances inconnues | haute | aucune acceptation implicite | rapport et remédiation |
| SEC-009 | Pas d'analyse sécurité dédiée en CI | moyenne | PR coordonnée requise | workflow minimal et épinglé |

Une acceptation doit nommer propriétaire, justification, compensation,
échéance et date de réexamen. Aucun risque critique n'est accepté par V5-A.
