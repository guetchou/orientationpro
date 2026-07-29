# Remédiation des dépendances — 2026-07-29

## Décision

**NO-GO public.** Les deux alertes Dependabot ouvertes ont un correctif dans ce
lot, mais `npm audit` conserve des chaînes qui exigent des migrations majeures.
Elles sont compensées par l'absence d'activation publique et doivent être
réévaluées avant le 5 août 2026.

## Alertes Dependabot régénérées sur `e0601ce`

| Alerte | Dépendance | Manifest / portée | Gravité | Affectée | Corrigée | Exploitabilité observée | Propriétaire | Échéance | Décision |
|---|---|---|---|---|---|---|---|---|---|
| #303 / GHSA-4c8g-83qw-93j6 | `fast-uri` | `package-lock.json` / développement, transitive | haute | `>=3.0.0 <3.1.3` | `3.1.4` | parseur de schéma de build, absent du runtime livré | mainteneur V5 | 2026-07-29 | corriger |
| #149 / GHSA-48c2-rrv3-qjmp | `yaml` | `package-lock.json` / runtime selon GitHub, directe d'outillage sécurité | moyenne | `>=2.0.0 <2.8.3` | `2.8.3` | analyse de workflows suivis, pas d'entrée utilisateur au runtime | mainteneur V5 | 2026-07-29 | corriger |

Le compteur global « 78 vulnérabilités » affiché par GitHub n'est pas le nombre
d'alertes ouvertes : l'API Dependabot a retourné exactement les deux lignes
ci-dessus au moment du relevé.

## Matrice npm après correctifs compatibles

Commandes exécutées :

```bash
npm audit --json
npm audit --omit=dev --json
npm --prefix backend audit --json
npm --prefix backend audit --omit=dev --json
```

Résultats : racine complète 26 (22 hautes, 3 moyennes, 1 basse), racine production 8
(5 hautes, 3 moyennes), backend complet et production 2 moyennes. Avant
remédiation : 33 à la racine et 10 au backend. Les dépendances LangChain
directes, sans import dans le dépôt, ont été supprimées.

| Dépendance(s) | Manifest / portée | Gravité | Version affectée / cible | Exploitabilité réelle | Propriétaire / échéance | Décision |
|---|---|---|---|---|---|---|
| `react-router`, `react-router-dom` | racine / production | moyenne | `6.x` / `7.18.2` | navigation client ; migration majeure requise, pas de SSR React Router | mainteneur frontend / 2026-08-05 | compenser : pilote fermé, entrées URL bornées |
| `vite`, `esbuild` | racine / build classé production | haute/moyenne | Vite `<=6.4.2` / `8.1.5` | serveur de développement uniquement, non exposé en production | mainteneur build / 2026-08-05 | compenser : aucun serveur dev public |
| `brace-expansion`, `minimatch`, `glob`, `sucrase` | racine / chaîne de build classée production | haute | plages audit / migration Vite-ESLint | entrées locales de build ; risque DoS, pas de chemin HTTP runtime identifié | mainteneur build / 2026-08-05 | compenser puis migrer |
| `eslint`, `@eslint/config-array`, `@eslint/eslintrc` | racine / développement | haute | ESLint `9.x` / `10.8.0` | analyse de sources locales en CI | mainteneur CI / 2026-08-05 | accepter temporairement, migration majeure planifiée |
| `typescript-eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/utils` | racine / développement | haute | `8.x` / correctifs compatibles futurs | analyse de sources locales en CI | mainteneur CI / 2026-08-05 | accepter temporairement |
| `@vitest/coverage-v8`, `test-exclude` | racine / développement | haute | `3.2.7` / `4.1.10` | couverture de tests locale, aucun runtime | mainteneur tests / 2026-08-05 | accepter temporairement, migration majeure |
| `vite-plugin-pwa`, `workbox-build`, `@trickfilm400/rollup-plugin-off-main-thread`, `ejs`, `jake`, `filelist` | racine / développement | haute | chaîne PWA actuelle / cible `1.2.0` signalée par audit | génération du service worker ; cible proposée est un downgrade incompatible | mainteneur PWA / 2026-08-05 | compenser : flags OFF, revue PWA dédiée |
| `sequelize`, `uuid` imbriqué | backend / production | moyenne | Sequelize `6.37.8`, uuid `8.3.2` / cible audit incohérente `3.30.0` | anciens contrôleurs legacy uniquement ; APIs legacy désactivées par défaut | mainteneur backend / 2026-08-05 | compenser : gate legacy OFF, migration ORM dédiée |

Chaque ligne possède donc manifest, portée, gravité, versions, exploitabilité,
propriétaire, échéance et décision. Une acceptation temporaire n'autorise aucune
activation publique.

## Reproduction

```bash
npm ci
npm --prefix backend ci
node scripts/security/dependency-report.cjs \
  --input root-all=/tmp/pr126-root-all-final.json \
  --input root-production=/tmp/pr126-root-production-final.json \
  --input backend-all=/tmp/pr126-backend-all-final.json \
  --input backend-production=/tmp/pr126-backend-production-final.json
node --test scripts/security/dependency-report.test.cjs
```

Le générateur conserve chaque dépendance, chemin `node_modules`, correctif
disponible et portée d'audit. Il ne transforme jamais automatiquement un relevé
en acceptation de risque.
