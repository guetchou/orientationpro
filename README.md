# MAKOKI

MAKOKI est une plateforme web d’exploration professionnelle. Elle aide une personne à structurer son profil, explorer ses intérêts RIASEC, rapprocher ses compétences de métiers ESCO/O*NET et conserver des résultats versionnés et explicables.

## Statut méthodologique

Le questionnaire RIASEC MAKOKI est un **outil d’exploration des intérêts professionnels**. Sa banque d’items est originale au projet, versionnée et maintenue au statut `draft` tant qu’une revue métier, un prétest de compréhension et une validation psychométrique documentée n’ont pas été réalisés.

Les scores sont descriptifs :

- aucune dimension n’est interprétée comme une aptitude ou un niveau d’intelligence ;
- aucune égalité n’est départagée artificiellement ;
- aucun percentile n’est produit sans population normative documentée ;
- aucun pourcentage de confiance, de fiabilité ou de validité n’est inventé ;
- les recommandations servent à explorer des pistes, sans garantir admission, emploi ou réussite.

O*NET et ESCO sont utilisés comme référentiels professionnels et de compétences. Les items du questionnaire MAKOKI ne reproduisent ni n’adaptent les items de l’O*NET Interest Profiler.

## Architecture actuelle

| Couche | Technologie |
|---|---|
| Web | React, TypeScript, Vite, Tailwind CSS |
| API | Node.js, Express |
| Données | MySQL 8, migrations versionnées |
| Identité | Auth V1, JWT et sessions révocables |
| Référentiels | ESCO et O*NET importés localement |
| Déploiement | Docker, Docker Compose, GitHub Actions, VPS |

MySQL est la source de vérité des comptes, profils, passations, résultats, recommandations, snapshots et analyses CV. Les nouveaux parcours ne doivent pas ajouter de dépendance à Supabase.

## Parcours principaux

- inscription, vérification d’adresse, connexion et récupération du compte ;
- profil adaptatif avec études, compétences ESCO et hypothèses contrôlées ;
- passation RIASEC authentifiée et calcul côté serveur ;
- recommandations métiers contextualisées et explicables ;
- snapshots immuables des recommandations ;
- analyse CV versionnée.

## API canonique RIASEC

```text
GET  /api/v1/orientation/riasec/instrument
POST /api/v1/orientation/riasec/attempts
GET  /api/v1/orientation/riasec/attempts/:attemptId
POST /api/v1/orientation/riasec/attempts/:attemptId/submit
GET  /api/v1/orientation/results
GET  /api/v1/orientation/results/:resultId
```

Les anciennes routes ATS ne calculent plus de résultat RIASEC. Elles renvoient `410 LEGACY_RIASEC_RETIRED` et orientent vers l’API canonique.

## Développement

Prérequis : Node.js 20+, npm, Docker et Docker Compose.

```bash
npm ci
npm --prefix backend ci
npm run typecheck
npm run lint
npm test
npm --prefix backend test
npm run build
```

Tests MySQL isolés :

```bash
npm --prefix backend run test:mysql
```

Variables principales :

```text
AUTH_V1_ENABLED=true
RIASEC_API_ENABLED=true
RIASEC_ALLOW_DRAFT=true
CAREER_API_ENABLED=true
CV_API_V1_ENABLED=true
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=orientationpro
DB_PASSWORD=...
DB_NAME=orientationpro
```

`RIASEC_ALLOW_DRAFT=true` autorise explicitement l’instrument de travail. Un passage à `pilot` ou `active` exige une décision humaine documentée et une nouvelle version immutable.

## Gouvernance et documentation

- `docs/adr/0003-versioned-riasec-results.md` — résultats RIASEC versionnés ;
- `docs/adr/0005-esco-fr-presentation-and-onet-riasec.md` — rôle respectif d’ESCO et O*NET ;
- `docs/adr/0008-riasec-v2-governance.md` — règles RIASEC v2 et moteur unique ;
- `docs/riasec/INSTRUMENT_PROVENANCE.md` — provenance, licence et validation ;
- `docs/riasec/ENGINE_AUDIT.md` — inventaire avant/après des moteurs.

## CI et production

La CI exécute deux jobs principaux :

1. qualité web, tests, build et smoke navigateur ;
2. backend, MySQL et parcours authentifiés.

Les preflights construisent les images et vérifient les migrations. La production est déployée uniquement par `.github/workflows/production-deploy.yml`, sur un SHA exact de `main`, avec contrôle des endpoints publics.

## Licence et référentiels externes

Le code du projet suit la licence du dépôt. Les contenus et données externes conservent leurs propres conditions de licence et d’attribution. Les imports ESCO/O*NET enregistrent version, provenance, URL, licence et empreinte de contenu.
