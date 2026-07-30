# Gate de production Vague 5 — 2026-07-29

## Décision

**NO-GO pour une activation publique ou un pilote.**

Cette décision porte sur le candidat intégré dont le parent est
`00520727c2e9ab8b17ad2d2c13fefc4a3d43f7e9`. Elle n’active aucun feature flag
et ne vaut pas autorisation de déploiement. Un futur `GO` exige une décision
explicite et distincte du mainteneur.

## Périmètre vérifié

V3 et V4 sont closes. Les lots V5 suivants sont fusionnés dans `main`, dans
l’ordre contrôlé :

| Lot | PR | Commit de fusion |
|---|---:|---|
| modèle de menace | #103 | `4afd0599b96f03c195b9e22d44cf6ea386006d05` |
| routes legacy | #121 | `fae44f5049fae468c9775eec159357c7eff06ff0` |
| rate limiting | #123 | `de5a29880a5571a31133a9df6e1178b7992893f0` |
| sauvegarde et rollback | #108 | `ed68c950a7d69abbf289b7334105a7bb2dd03a03` |
| observabilité | #109 | `9737be9d13edd143c5141245f86bbc072c469738` |
| logger et redaction runtime | #124 | `be099182d1c7f904ba21878f72c8b11fc540ecac` |
| gouvernance des données | #110 | `1b884a42b6a6e45eef6dfea19e6db61b209b00f3` |
| droits sur les données | #125 | `caeacd2277cfa8393482cd7aba62eccc430dfcfe` |
| mesure descriptive | #111 | `e0601ce6587da6ee9c34d98751a7aa84334bf9f3` |
| dépendances | #126 | `9c7c4459d5195c7cc7f3d3ebe8a5b5f0586aa62e` |
| navigateurs et accessibilité | #127 | `00520727c2e9ab8b17ad2d2c13fefc4a3d43f7e9` |

## Registre des preuves

Une preuve n’est recevable que si elle contient le SHA testé, l’horodatage UTC,
la commande exacte, l’environnement et ses versions, le résultat et son seuil,
un artefact ou log identifiable, ainsi que les limites de l’essai. Une CI verte
est un contrôle de régression, pas une preuve d’impact ou d’aptitude à produire.

| Contrôle | Preuve observée | Résultat | Limites |
|---|---|---|---|
| CI du dernier lot intégré | SHA `8c713bb90849991be89e52aaf7afaaf9c44c184f`, 2026-07-29, GitHub Actions Ubuntu/Node 20/MySQL 8, workflows Continuous Integration, Release Preflight et Wrapper | 5/5 jobs verts | valide #127 avant fusion ; ne remplace pas les essais manuels |
| suite locale complète | SHA de contenu `b607a2d430ab66d18d5b155740b0039adcdf42c0`, `npm run check`, Linux/Node 22.23.1 | vert, dont 277/277 tests backend et build | mêmes fichiers que `8c713bb`, qui est un commit vide de déclenchement CI |
| Firefox et WebKit automatisés | SHA `b607a2d430ab66d18d5b155740b0039adcdf42c0`, `npm run build && npm run test:e2e:accessibility`, Firefox Playwright 150.0.2 et WebKit Playwright 26.4 | 8/8 tests verts, seuil zéro violation axe sélectionnée | connexion, fail-closed, reflow et hors-ligne limités seulement |
| consentement, provenance et mesure | tests backend fusionnés de #110/#111 | vert en tests déterministes | aucune causalité ni impact réel démontré |
| export, correction, isolation et suppression | test MySQL jetable de #125 | vert sur le SHA de #125 | doit être rejoué par la CI du candidat final |
| sauvegarde/restauration et rollback | scripts Docker/MySQL jetables de #108 | vert sur le SHA de #108 | doit être rejoué sur le candidat final ; `/tmp` n’est pas une sauvegarde durable |
| charge infrastructure | `node scripts/release/load-smoke.cjs http://127.0.0.1:PORT/api/test/health 300 10` | contrôle borné disponible | `/health` n’est pas un endpoint métier et ne valide pas la capacité fonctionnelle |

## Contrôles sans preuve suffisante

| Contrôle requis | État | Conséquence |
|---|---|---|
| parcours navigateur authentifié création → clarification → scénario → plan → action → blocage → reprise → réorientation | non exécuté sur le candidat intégré | bloquant |
| isolation multi-compte et versions obsolètes dans ce parcours navigateur | seulement couvert au niveau API/tests | bloquant pour le gate public |
| interruption réseau, faible bande passante, changement de projet et reprise sans perte | contrôles partiels, pas de parcours intégré réel | bloquant |
| charge sur endpoints métier authentifiés | non exécutée | bloquant |
| Safari réel sur macOS | non exécuté ; WebKit Playwright n’est pas Safari | bloquant |
| lecteur d’écran réel | non exécuté | bloquant |
| zoom navigateur exact à 200 % et revue clavier complète | non exécutés ; 320 px n’est qu’un proxy de reflow | bloquant |
| vulnérabilités résiduelles | le push GitHub du 29 juillet rapporte 9 vulnérabilités sur la branche par défaut, dont 2 hautes et 7 modérées | correction ou acceptation formelle requise |
| accord explicite du mainteneur | absent | activation interdite |

## Critères de sortie

Un `GO LIMITÉ` nécessite au minimum : toutes les preuves bloquantes ci-dessus,
une petite cohorte fermée et consentie, des flags toujours réversibles, une
surveillance active, des seuils d’arrêt documentés et un arrêt d’urgence testé.
Un `GO` exige en plus une décision explicite du mainteneur. Ni un clic, ni une
complétion, ni une statistique descriptive ne constitue une preuve d’impact.

## Rollback

Cette PR ajoute des contrôles, des tests et de la documentation sans activer de
fonction. Son rollback consiste à revenir au commit parent de la PR. Le rollback
applicatif reste celui de `docs/operations/DEPLOYMENT_ROLLBACK_RUNBOOK.md` et la
restauration celui de `docs/operations/BACKUP_RESTORE_RUNBOOK.md`.
