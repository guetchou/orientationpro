# Registre des risques V5-A

Observation : 2026-07-29. Base : `fae44f5` (#103 et #121 intégrées). Révision
obligatoire après chaque fusion V5 modifiant une frontière de sécurité.

| ID | Nature | Risque ou constat | Preuve/source | Gravité | Propriétaire | Échéance | Décision | Clôture |
|---|---|---|---|---:|---|---|---|---|
| SEC-001 | fait + risque résiduel | Routes legacy désactivées globalement ; réactivation ou migration incomplète encore possible | `legacy-api.js`, `legacy-api-security.test.js`, `AUTHORIZATION_MATRIX_V1.md` | haute | mainteneur V5 | avant fusion #112 | compensé temporairement par #121, non accepté en production | matrice route/Permission, preuve de remplacement et retrait |
| SEC-002 | fait vérifié | Aucun rate limiting central | `audit-repository.cjs` sur `fae44f5` | haute | lot #123 | avant fusion #123 | bloquant, non accepté | limites auth/upload testées |
| SEC-003 | fait vérifié | Logs directs ; sérialisation allowlist non raccordée au runtime | `backend/src/server.js`, audit sur `fae44f5` | critique | lot #124 | avant fusion #124 | bloquant, non accepté | logger raccordé et canaris |
| SEC-004 | fait vérifié | Alias legacy `superadmin` encore interprété | `backend/src/middleware/auth.middleware.js`, `backend/src/security/cv-access.js` | haute | mainteneur V5 | avant fusion #112 | bloquant, non accepté | migration, tests et date de retrait documentés |
| SEC-005 | fait vérifié | Identifiants de démo présents dans des scripts legacy | `scripts/activate-demo-complete.sh`, `scripts/setup-test-environment.sh` | critique | mainteneur sécurité | avant fusion #112 | bloquant, non accepté | retrait, rotation vérifiée et scan historique |
| SEC-006 | inconnue | Isolation CPU/temps/mémoire du parseur document non démontrée | aucune preuve d’exécution identifiée sur `fae44f5` | haute | mainteneur V5 | avant fusion #112 | bloquant avant public | limites et essais réels documentés |
| SEC-007 | hypothèse de régression | Un raccord V5 pourrait régresser isolation, reprise ou consentement V3/V4 | contrats et tests V3/V4 présents ; intégrations V5 futures non testées | critique | chaque lot V5 | après chaque rebase, avant fusion | bloquant si non testé | tests différentiels sur le dernier SHA |
| SEC-008 | inconnue à régénérer | Nombre et exploitabilité des vulnérabilités de dépendances après intégration | `security:dependencies` et Dependabot à exécuter dans #126 | haute | lot #126 | avant passage Ready de #126 | aucune acceptation implicite | matrice, propriétaire et remédiation |
| SEC-009 | fait vérifié | Audit dépôt présent dans `security:check`, audit dépendances encore exclu | `package.json`, `.github/workflows/deploy.yml` | haute | lot #126 | avant passage Ready de #126 | blocage limité à #126/#112, non présenté comme couvert | job dépendances bloquant ou exception formelle |

Une acceptation doit nommer propriétaire, justification, compensation,
échéance et date de réexamen. Aucun risque n’est accepté par V5-A.
