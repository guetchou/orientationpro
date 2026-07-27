# CV Optimizer V1 — Base source

## Décision de base

- **Branche créée** : `feat/cv-optimizer-v1`
- **Worktree** : `/opt/worktrees/orientationpro-cv-optimizer-v1`
- **SHA de base** : `708372c789abc148558241e234b567dd64913d3f`
- **Branche parente** : `feat/riasec-ux`
- **Date de création du worktree** : 2026-07-27 (UTC)

## Justification (règles §2)

1. **Backend = 86cfde3** : `git diff 86cfde3 feat/riasec-ux -- backend` est **vide** → backend strictement identique au commit canonique prouvé lors de la validation RIASEC (image API = 15/15 fichiers byte-identiques à 86cfde3).
2. **Inclut le design déployé** : `feat/riasec-ux` porte les refontes éditoriales réellement en production (accueil, conseillers, tests, emploi + palette verte MAKOKI + polices + vrai 404).
3. **Inclut le correctif mobile** : `2c5e5a67` (`fix/mobile-riasec-card-overflow`) est **ancêtre** de `feat/riasec-ux` (vérifié par `merge-base --is-ancestor`).
4. **Aucune modification perdue** : le worktree part du tip commité `708372c` ; les 37 changements non commités de `/opt/orientationpro` (résidu pré-existant : docs `.md` supprimés, `.dockerignore`, favicon, dossiers outillage non suivis) restent intacts dans `/opt/orientationpro`, non touché.
5. **Existe sur GitHub** : `feat/riasec-ux` est publiée (PR #17 ouverte depuis cette branche).

## État du backend

- Identique à `86cfde3` (origin/main). API de production active = exactement ce backend (provenance prouvée).
- Dépendances d'extraction déjà présentes : `mammoth ^1.9.1`, `pdf-parse ^1.1.1`, `pdfkit ^0.17.1`.

## État du frontend

- `feat/riasec-ux` = frontend réellement déployé (conteneur web construit depuis `/opt/orientationpro/.vps`).

## Audit du module CV existant (à remplacer)

Anti-patterns confirmés dans `src/pages/CVOptimizer.tsx`, `CVHistory.tsx`, `src/components/admin/ats/` :

| Anti-pattern | Occurrences |
|---|---|
| `FileReader.readAsText` (lecture PDF client) | 3 |
| `Math.random` (score/traitement aléatoire) | 4 |
| `OrientationPro` (ancienne marque) | 4 |
| `orientationpro.cg` (ancienne adresse) | 2 |
| « probabilité » (d'entretien) | 27 |
| `setTimeout` (fausse progression) | 8 |
| « confiance » (fausse) | 20 |

- Route `/cv-optimizer` : **non protégée** (pas de `UserRoute`).
- Dépendance publique directe au composant admin `CVUploadZone`.

## Périmètre strict

- Ne pas toucher : MySQL RIASEC (60 items), catalogue O*NET (1016 métiers), module RIASEC/carrière, `.env.vps`, Nginx.
- Backend RIASEC/carrière doit rester vert.
