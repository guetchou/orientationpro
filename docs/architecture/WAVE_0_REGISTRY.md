# Registre de livraison — Vague 0

Statut : clôturée

Ce registre décrit les fondations fusionnées dans `main`. Il ne signifie pas que le Parcours MAKOKI, sa persistance, ses API ou son interface sont déjà disponibles aux utilisateurs.

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
| W0-D | Contrats `Fact`, `Hypothesis`, `Evidence` | merged | W0-E | `backend/src/provenance/**`, test et ADR dédiés, sans modifier le profil | aucune | #84 |

## Réservations centrales après clôture

Aucune modification parallèle sans issue d’intégration :

| Ressource | Statut | Propriétaire de fusion |
|---|---|---|
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur |
| `backend/src/server.js` | libre, intégration seulement | mainteneur |
| `.github/workflows/**` | libre, intégration seulement | mainteneur |
| `backend/migrations/**` | réservation obligatoire | mainteneur |
| machine à états `LifeProject` | contrat fusionné, modifications via lot dédié | mainteneur |
| provenance générique | contrat fusionné, modifications via lot dédié | mainteneur |

## Registre des migrations

Source observable : `backend/migrations/`. Aucun lot de la Vague 0 n’a créé ou réservé une migration.

| Numéro | Lot | Branche/PR | État |
|---|---|---|---|
| prochain numéro | non réservé | — | libre après inspection de `main` |

La mention « prochain numéro » n’autorise aucune création. Le numéro exact doit être vérifié et réservé dans la même mise à jour du registre de la vague concernée.

## Suite autorisée par les fondations

```text
Vague 0 clôturée
-> Vague 1A : persistance et API du projet de vie derrière feature flag
-> Vague 1B : triage et shell du Parcours MAKOKI
-> orchestration progressive du profil, de RIASEC, de la carrière et des synthèses
```

Les contrats fusionnés ne doivent pas être présentés comme une capacité produit déjà active. L’intégration au serveur, les migrations et l’interface restent des lots distincts, séquentiels et testés.

## Règle de maintien

Toute évolution d’un contrat fusionné passe par une issue dédiée et une nouvelle version en cas de rupture. Les registres des vagues suivantes doivent continuer à distinguer ce qui est conçu, implémenté, exécuté, testé et validé.
