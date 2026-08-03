# Rapport consolidé — campagne de tests IA #216 (parcours invité → compte → rapport)

Branche : `agent/riasec-guest-journey-test-campaign-v1` (base : `main`, dernier commit intégré `cad3b08`).
PR de vérification : #225 (brouillon, ouverte pour déclencher réellement le nouveau workflow — non destinée à être fusionnée telle quelle).

Statuts utilisés : **conçu** (décidé) · **implémenté** (code écrit) · **exécuté** (lancé au moins une fois) ·
**testé** (assertions automatiques) · **validé** (vert de façon reproductible, preuve consignée).

## 1. Banque d'oracles RIASEC — conçu / implémenté / exécuté / testé / **validé**

- `backend/scripts/generate-riasec-oracles.js` — importe le **vrai** `scoreRiasec()` + `instrument.js`, ne devine aucun score. Génère aussi `riasec-items.v1.json` (table id → prompt/dimension), nécessaire car l'ordre des affirmations est mélangé côté serveur à chaque tentative.
- Sortie versionnée : `tests/life-project/oracles/riasec-profiles.v1.json` (12 profils), `riasec-items.v1.json` (60 items).
- `backend/test/riasec-oracle-bank.test.js` — 6 tests, y compris un test de mutation délibérée (corrompt une copie et vérifie que la comparaison échoue).
- **Preuve** : `node --test backend/test/riasec-oracle-bank.test.js` → 6/6 verts (rejoué à plusieurs reprises pendant cette campagne, y compris juste avant la recette production).

## 2. Fixtures et seed backend — conçu / implémenté / exécuté / testé / **validé**

- `backend/scripts/e2e-life-project-seed.js` (patron `e2e-ats-candidate-seed.js`), `tests/life-project/fixtures.ts`, `global-setup.ts`, `global-teardown.ts`, `smtp-catcher.cjs` (attrapeur SMTP maison, aucun envoi réel), `mail.ts`.
- **Preuve** : utilisé avec succès par les 3 fichiers de spec (33 tests au total) contre une base MySQL jetable dédiée (port 34075), backend/frontend/SMTP éphémères.

## 3. Plan de test versionné — conçu / implémenté / **validé**

- `docs/testing/life-project-test-plan.v1.md`, écrit avant l'implémentation des tests, mappant le parcours critique et les scénarios de résilience aux fichiers de test.
- **Limite assumée** : le plan initial décrivait un parcours en plusieurs étapes séparées (situation/compétences/contraintes) qui a depuis été simplifié en un formulaire unique (`LifeProjectWorkspace`, refonte via PR #224) ; les tests réellement écrits suivent le parcours **actuel**, pas le plan initial à la lettre — la structure globale (invité → compte → rapport) reste fidèle à l'intention du plan.

## 4. Suite Playwright déterministe — conçu / implémenté / exécuté / testé / **validé**

**19 tests, tous exécutés réellement** (backend + MySQL + frontend jetables, jamais de simulation) :

| Fichier | Tests | Objet |
|---|---|---|
| `critical-path.spec.ts` | 5 | Invité → RIASEC → aperçu limité (pas d'option "continuer sans compte", parcours durci depuis PR #222/#224) → compte → vérification e-mail → connexion → **rattachement sans repasser le questionnaire** → profil complet → situation → pistes → choix → comparaison + synthèse imprimable → déconnexion/reconnexion → persistance |
| `riasec-oracles.spec.ts` | 6 | Rejoue des profils d'oracle en navigateur réel, compare le score **stocké en base via l'API** (pas seulement affiché) à la valeur exacte attendue — dominant-i, égalité en tête, réponses identiques/minimales/maximales, variation d'une seule réponse |
| `resilience.spec.ts` | 8 | Rafraîchissement, deux onglets, double-clic, réseau coupé, cookie supprimé, e-mail déjà utilisé, rattachement rejoué, petit écran |

**Preuve** : dernière exécution locale complète, 19/19 verts (`npx playwright test --config=playwright.life-project.config.ts`).

### Bugs applicatifs réels trouvés et corrigés (pas des bugs de test)

1. **`src/pages/VerifyEmail.tsx`** — React.StrictMode (dev uniquement) invoque l'effet de vérification deux fois ; le jeton étant à usage unique côté serveur, le second appel échouait en 400. Corrigé en partageant la même requête en vol entre les deux invocations. Sans effet en production (StrictMode ne double-invoque pas en build de production).
2. **Rate-limits de test** (`RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_EXPENSIVE_MAX`) desserrés dans `playwright.life-project.config.ts`, **uniquement pour le backend jetable de test** — les vraies limites de production (`backend/src/server.js`) ne sont pas touchées. Cette suite enchaîne délibérément plus de connexions/tentatives RIASEC qu'un usage normal sur une fenêtre de 15 minutes.

## 5. Campagne exploratoire — conçu / implémenté / exécuté / **validé**

- `docs/testing/life-project-exploratory-findings.md` : 5 scénarios explorés (bouton précédent, paramètres de requête inattendus/XSS, texte long/caractères spéciaux, régénération des pistes après un choix).
- **Une observation UX réelle retenue** (non corrigée, hors mandat de cette campagne) : régénérer "Préparer mes pistes" sans modifier le formulaire efface silencieusement la piste choisie et sa synthèse, sans avertissement — décision produit à trancher.
- Un timeout observé pendant le triage a été isolé jusqu'à sa cause exacte (bug du script exploratoire lui-même, pas de l'application) — voir le document pour la trace complète.
- Garde-fou respecté : aucune observation traitée comme bloquante sans reproduction déterministe ; aucune règle métier, score attendu, permission ou contrôle de sécurité modifié.

## 6. Workflow GitHub Actions — conçu / implémenté / exécuté / testé / **validé**

- `.github/workflows/life-project-e2e.yml` : déclenché manuellement (`workflow_dispatch`) et sur les chemins orientation/life-project/capabilities/features/tests concernés. Service MySQL éphémère, seed, vérification de la banque d'oracles, puis la suite Playwright complète. Ne touche jamais au déploiement ni à `production-deploy.yml`.
- `workflow_dispatch` ne se déclenche que depuis la branche par défaut — cette branche n'y étant pas encore fusionnée, le workflow a été prouvé via une PR de vérification (#225, brouillon) qui déclenche l'événement `pull_request` du même fichier.
- **Preuve d'exécution réelle sur GitHub Actions** (pas seulement une validation syntaxique) : run [30784335977](https://github.com/guetchou/orientationpro/actions/runs/30784335977) — **vert, 3m45s, 19/19 tests passés**.

## 7. Recette production non destructive — conçu / implémenté / exécuté / testé / **validé**

- `scripts/release/life-project-production-recette.cjs` : vérifie le SHA servi, le registre de capacités public, l'instrument RIASEC public (60 items), puis exécute une vraie passation invité contre `https://makoki.org` (gestion manuelle du cookie de session, aucune bibliothèque) et compare le score exact retourné à la banque d'oracles.
- **Exécutée réellement contre la production, avec l'accord explicite de l'utilisateur avant le lancement** : SUCCÈS. Preuve : `docs/testing/life-project-production-recette-last-run.json` (SHA servi `b17afff2...`, score R-I-A/RIA identique à l'oracle `dominant-r`).
- **Décision assumée, signalée explicitement** : la recette reste bornée à l'invité (aucun compte réel créé, aucune donnée personnelle). Deux sessions invité de test ont été créées sur la production pendant la mise au point (la première run a révélé un bug du script — code HTTP attendu incorrect — corrigé avant la run retenue comme preuve). Les deux expireront automatiquement sous 7 jours via la purge de session invité déjà existante côté backend ; documentées ici plutôt que supprimées manuellement, conformément au principe « nettoyée ou documentée ».
- **Constat notable** : la production redéploie en continu (le SHA servi a changé deux fois pendant cette seule campagne). La recette vérifie donc le comportement **actuellement déployé**, pas un commit figé — c'est le comportement correct pour un environnement en déploiement continu, mais cela s'écarte de l'hypothèse initiale du plan (un commit de référence fixe).

## 8. Rapport consolidé — ce document

## Garde-fous de l'issue #216 — respectés

- Aucune fermeture des issues #205 ou #169.
- Aucune donnée réelle de jeune : tous les comptes de test utilisent des adresses `@example.test` horodatées, aucune donnée personnelle réelle saisie même dans les tests de production.
- Aucune modification automatique d'attente métier : les 2 bugs applicatifs corrigés (StrictMode, rate-limit de test) sont des corrections techniques, aucun score attendu, règle métier, permission ou contrôle de sécurité n'a été modifié pour faire passer un test.
- Toute anomalie exploratoire triée avant d'être remontée (voir §5) — aucune n'a été traitée comme bloquante sans reproduction déterministe.
- Artefacts créés en production documentés (§7), pas supprimés manuellement — conforme à la purge automatique déjà existante.
- Branche dédiée, jamais fusionnée sans validation explicite.

## Limites générales assumées

- La suite déterministe a été exécutée en local et une fois en CI (run ci-dessus) ; elle n'a pas encore tourné de façon répétée dans le temps pour établir une mesure de stabilité (flakiness) sur plusieurs jours.
- La recette production n'a été exécutée qu'une seule fois avec succès (deux fois au total en comptant la run révélant le bug de script) — une seule preuve dans le temps, pas un suivi continu programmé.
- Le rapport #216.8 documente une observation UX non corrigée (régénération des pistes) qui reste à trancher par le responsable produit.
