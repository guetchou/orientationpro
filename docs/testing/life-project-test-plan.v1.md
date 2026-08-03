# Plan de test v1 — parcours invité → compte → rapport (issue #216)

Rédigé avant l'implémentation des tests (rôle « agent planner » de l'architecture demandée par #216). Base de référence : commit `6576b7a1a1d10a7db3f33c41e1bbf5e615fcce4f` (PR #215), qui est aussi le SHA actuellement servi en production.

## Portée

Couvre le parcours `/parcours` : RIASEC invité → scores/classement → familles/fiches métiers → création de compte ou connexion → rattachement → situation/scénarios/choix/action → rapport unique → déconnexion/reconnexion → persistance. Exécuteur déterministe : Playwright Test, contre backend + MySQL jetables (jamais contre des mocks pour les assertions de score/persistance).

## Banque d'oracles utilisée

`tests/life-project/oracles/riasec-profiles.v1.json`, 12 profils générés par `backend/scripts/generate-riasec-oracles.js` à partir du moteur réel (`scoreRiasec` + `instrument.js`, 60 items, algorithme `riasec-makoki-scoring-v2`). Garantie de cohérence : `backend/test/riasec-oracle-bank.test.js` (6 tests, y compris un test de mutation).

## Suite Playwright — `tests/life-project/`

### `critical-path.spec.ts` (3 tests, `describe.serial`)

| # | Nom | Objectif | Assertions clés | Échec légitime si |
|---|---|---|---|---|
| 1 | invité → RIASEC → scores → familles | Étapes 1-5 du parcours critique | Session invité obtenue sans compte ; 60 réponses du profil `dominant-r` saisies ; scores/classement affichés correspondent **exactement** à l'oracle `dominant-r` (via lecture DOM + réponse API) ; lien vers familles/fiches métiers accessible | Le score affiché diverge de l'oracle, même d'un point ; l'accès à `/parcours` ou aux fiches exige une connexion |
| 2 | compte → rattachement sans perte/duplication → situation → scénarios → choix → action → rapport | Étapes 6-11 | Compte créé ; **même** `resultId`/scores après rattachement qu'avant (comparaison d'identifiants, pas seulement de présence) ; aucune deuxième ligne de résultat créée ; formulaire situation soumis ; scénarios générés et comparables ; une option retenue ; une action créée ; rapport affiche les données cohérentes avec les étapes précédentes | Le rattachement crée un nouveau résultat au lieu de transférer l'existant ; le rapport affiche des données différentes de celles saisies |
| 3 | déconnexion → reconnexion → persistance complète | Étapes 12-14 | Après reconnexion (même contexte), scénario retenu + action + rapport identiques à avant déconnexion | Une donnée disparaît ou change après reconnexion |

### `riasec-oracles.spec.ts` (6 tests)

| # | Profil oracle | Objectif |
|---|---|---|
| 4 | `dominant-i` | Second profil dominant distinct du parcours principal — confirme que ce n'est pas un hasard lié à `dominant-r` |
| 5 | `tie-top` | Égalité de tête (A/S) — confirme le tri par ordre canonique côté navigateur, pas seulement côté moteur |
| 6 | `all-identical-mid` | Toutes réponses identiques — confirme l'absence de code à 3 lettres affiché quand `primaryCode=null` |
| 7 | `all-minimum` | Réponses minimales — confirme que l'UI n'affiche pas 0 (nuance des items inversés) |
| 8 | `all-maximum` | Réponses maximales — confirme que l'UI n'affiche pas 100 |
| 9 | `single-item-variation` | Paire de jeux différant d'une réponse — deux passations dans le même test, diff exact attendu sur une seule dimension |

### `resilience.spec.ts` (10 tests)

| # | Scénario | Objectif | Échec légitime si |
|---|---|---|---|
| 10 | Rafraîchissement en cours de passation | Reprise du brouillon `localStorage` (`makoki.riasec.draft.v1`) après `page.reload()` à mi-parcours | Les réponses déjà données sont perdues |
| 11 | Abandon et reprise (nouveau contexte, cookie conservé) | Le travail invité survit à la fermeture/réouverture du navigateur tant que le cookie est valide | La session invité n'est pas retrouvée |
| 12 | Deux onglets sur la même session invité | Pas de corruption de données quand deux onglets soumettent concurremment | Une réponse écrase l'autre de façon incohérente, ou 5xx |
| 13 | Double-clic sur soumission | Un seul résultat créé malgré un double clic rapide sur "Voir mon profil" | Deux résultats/tentatives créés |
| 14 | Réseau interrompu | Requête de soumission avortée (route Playwright) → message d'erreur clair, pas de perte du brouillon | Écran blanc, ou brouillon perdu |
| 15 | Cookie supprimé en cours de route | Suppression du cookie invité entre deux étapes → redémarrage propre (nouvelle session), pas de crash | Erreur non gérée, 5xx |
| 16 | Email déjà utilisé | Inscription avec l'email du compte fixe `existingAccount` → erreur claire, pas de doublon de compte | Un second compte est créé, ou l'erreur est generique au point de ne rien dire d'exploitable |
| 17 | Rattachement rejoué | Second appel `POST /guest/claim` après un premier succès → réponse `not_found` contrôlée (comportement déjà confirmé côté backend), pas de duplication | Une deuxième copie des données est créée |
| 18 | Reconnexion dans un nouveau contexte navigateur | Login dans un `browser.newContext()` distinct → mêmes données que la session d'origine | Les données ne sont pas retrouvées dans le nouveau contexte |
| 19 | Mobile 320px + `prefers-reduced-motion` | `page.setViewportSize({width:320,...})` + `page.emulateMedia({reducedMotion:'reduce'})` → pas de débordement horizontal, parcours utilisable | Débordement horizontal, ou élément inaccessible |

### Garde-fou transverse (pas un test dédié)

Fixture partagée : `page.on('console', ...)` échoue le test sur toute erreur console inattendue ; `page.on('response', ...)` échoue le test sur tout 5xx. Appliqué à **tous** les tests ci-dessus via un hook commun (`tests/life-project/fixtures.ts`), pas via un 20e test séparé.

## Hors périmètre de cette version (documenté, pas oublié)

- Recette production : bornée à la partie invité (étapes 1-5) — voir `docs/testing/life-project-e2e-report.md` pour la justification.
- Aucun test ne modifie une attente métier (score, règle, permission) — si un test échoue, la correction porte sur le code, jamais sur l'oracle, sauf changement volontaire et documenté de l'instrument/algorithme.
