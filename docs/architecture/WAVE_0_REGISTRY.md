# Registre de livraison — Vague 0

Statut : actif

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
| W0-E | Gouvernance multi-agents | merged | W0-A2 | `.github/CODEOWNERS`, `.github/pull_request_template.md`, documentation de gouvernance | aucune | #76 |
| W0-B | Registre des capacités et feature flags | merged | W0-E | `backend/src/capabilities/**`, raccord serveur et tests | aucune | #80 |
| W0-C | Contrats `LifeProject`, `Scenario`, `ActionPlan` | merged | W0-E | `backend/src/life-project/**`, test et ADR dédiés | aucune | #83 |
| W0-D | Contrats `Fact`, `Hypothesis`, `Evidence` | active | W0-E | `backend/src/provenance/**`, test et ADR dédiés, sans modifier le profil | aucune | issue #79, branche `agent/provenance-contracts-v1` |

## Réservations centrales

Aucune modification parallèle sans issue d’intégration :

| Ressource | Statut | Propriétaire de fusion |
|---|---|---|
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur |
| `backend/src/server.js` | libre, intégration seulement | mainteneur |
| `.github/workflows/**` | libre, intégration seulement | mainteneur |
| `backend/migrations/**` | réservation obligatoire | mainteneur |
| machine à états `LifeProject` | contrat fusionné, modifications via lot dédié | mainteneur |
| provenance générique | réservée à W0-D | W0-D |

## Registre des migrations

Source observable : `backend/migrations/`. Avant ouverture d’un lot persistant, vérifier le dernier numéro sur `main` puis ajouter une ligne.

| Numéro | Lot | Branche/PR | État |
|---|---|---|---|
| prochain numéro | non réservé | — | libre après inspection de `main` |

La mention « prochain numéro » n’autorise aucune création. Le numéro exact doit être vérifié et réservé dans la même mise à jour de ce registre.

## Ordre immédiat

```text
W0-D provenance générique
-> clôture de la Vague 0
-> intégration Vague 1
```

L’intégration au serveur et aux migrations reste séquentielle et fera l’objet de lots distincts.

## Mise à jour du registre

Toute PR qui prend ou libère une réservation modifie ce fichier dans son premier commit ou dépend d’une PR de coordination dédiée. Une ligne n’est passée à `merged` qu’après observation de la fusion dans `main`.
