# Registre de livraison — Vague 0

Statut : initial

Ce registre réserve les contrats, chemins et ordres de fusion. Il ne prouve pas qu’un lot est implémenté.

## États

- `planned` : cadré, non démarré ;
- `active` : branche/PR en cours ;
- `blocked` : dépendance non satisfaite ;
- `review` : implémenté, preuves en revue ;
- `merged` : fusionné dans `main` ;
- `cancelled` : abandonné avec justification.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W0-A | Architecture cible | merged | — | `docs/architecture/MAKOKI_LIFE_PATH_ENGINE.md` | aucune | #67 |
| W0-A2 | Audit `as-is` | merged | W0-A | `docs/architecture/MAKOKI_AS_IS_AUDIT.md` | aucune | #74 |
| W0-E | Gouvernance multi-agents | active | W0-A2 | `.github/CODEOWNERS`, `.github/pull_request_template.md`, documentation de gouvernance | aucune | issue #75 |
| W0-B | Registre des capacités et feature flags | planned | W0-E | contrat à préciser après inspection | aucune prévue | à ouvrir |
| W0-C | Contrats `LifeProject`, `Scenario`, `ActionPlan` | planned | W0-E | `backend/src/life-project/**`, schémas partagés dédiés | à réserver si persistance | à ouvrir |
| W0-D | Contrats `Fact`, `Hypothesis`, `Evidence` | planned | W0-E | extension contrôlée de `backend/src/profile/**` ou module transversal décidé par ADR | à réserver si persistance | à ouvrir |

## Réservations centrales

Aucune modification parallèle sans issue d’intégration :

| Ressource | Statut | Propriétaire de fusion |
|---|---|---|
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur |
| `backend/src/server.js` | libre, intégration seulement | mainteneur |
| `.github/workflows/**` | libre, intégration seulement | mainteneur |
| `backend/migrations/**` | réservation obligatoire | mainteneur |
| machine à états `LifeProject` | réservée au futur W0-C | W0-C |
| provenance générique | réservée au futur W0-D | W0-D |

## Registre des migrations

Source observable : `backend/migrations/`. Avant ouverture d’un lot persistant, vérifier le dernier numéro sur `main` puis ajouter une ligne.

| Numéro | Lot | Branche/PR | État |
|---|---|---|---|
| prochain numéro | non réservé | — | libre après inspection de `main` |

La mention « prochain numéro » n’autorise aucune création. Le numéro exact doit être vérifié et réservé dans la même mise à jour de ce registre.

## Ordre immédiat

```text
W0-E gouvernance
-> W0-B capacités/flags
-> W0-C contrats projet de vie
-> W0-D provenance générique
-> Vague 1 shell et triage
```

W0-C et W0-D peuvent être préparés en parallèle uniquement après fixation de leurs frontières et avec des chemins sans chevauchement. Leur intégration au serveur et aux migrations reste séquentielle.

## Mise à jour du registre

Toute PR qui prend ou libère une réservation modifie ce fichier dans son premier commit ou dépend d’une PR de coordination dédiée. Une ligne n’est passée à `merged` qu’après observation de la fusion dans `main`.
