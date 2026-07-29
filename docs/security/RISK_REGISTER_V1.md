# Registre des risques V5-A

Observation : 2026-07-29. Base : `c561790`. Révision obligatoire après chaque
fusion V5 modifiant une frontière de sécurité.

| ID | Fait ou inconnue | Gravité | Décision | Clôture |
|---|---|---:|---|---|
| SEC-001 | Routes legacy sensibles non gardées | critique | bloquant, non accepté | flag OFF, authz, matrice et tests |
| SEC-002 | Aucun rate limiting central | haute | bloquant, non accepté | limites auth/upload testées |
| SEC-003 | Logs directs, sérialisation allowlist non raccordée | critique | bloquant, non accepté | logger raccordé et canaris #124 |
| SEC-004 | Alias legacy `superadmin` | haute | bloquant, non accepté | propriétaire, migration et échéance requis |
| SEC-005 | Identifiants de démo dans scripts legacy | critique | bloquant, non accepté | retrait, rotation et scan historique |
| SEC-006 | Isolation parseur document non prouvée | haute | bloquant avant public | limites CPU/temps/mémoire |
| SEC-007 | Régression V5 de l’isolation, de la reprise ou du consentement V3/V4 | critique | bloquant, non accepté | tests différentiels après chaque raccord |
| SEC-008 | Vulnérabilités de dépendances à régénérer | haute | aucune acceptation implicite | matrice, propriétaire et remédiation #126 |
| SEC-009 | Audits sécurité absents de la CI du dernier SHA | moyenne | bloquant, non accepté | `security:check` obligatoire en CI |

Une acceptation doit nommer propriétaire, justification, compensation,
échéance et date de réexamen. Aucun risque n’est accepté par V5-A.
