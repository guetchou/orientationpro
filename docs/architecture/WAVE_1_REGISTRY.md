# Registre de livraison — Vague 1

Statut : clôturé

Ce registre décrit les fondations techniques fusionnées de la première vague d’intégration du Parcours MAKOKI. Il ne constitue ni une validation scientifique ou terrain, ni une décision d’activation en production.

## Lots

| ID | Lot | État | Dépend de | Chemins principaux | Migration | Fusion |
|---|---|---|---|---|---|---|
| W1-A | Persistance MySQL du projet de vie | merged | Vague 0 | `backend/src/life-project/store.js`, tests MySQL, migrations | `011_life_projects` fusionnée | #90 |
| W1-B | API LifeProject v1 et feature flag | merged | W1-A | routeur, service, capacités et raccord serveur | aucune | #91 |
| W1-C | Triage et shell du Parcours MAKOKI | merged | W1-B | `src/features/life-project/**`, page, dashboard et raccord routeur | aucune | #92 |

## Ressources après clôture

| Ressource | Statut | Propriétaire |
|---|---|---|
| `backend/migrations/011_life_projects.*.sql` | fusionnée, modification par lot dédié | mainteneur |
| `backend/src/life-project/**` | fusionné, extension par lot dédié | mainteneur |
| `backend/src/server.js` | libre, intégration seulement | mainteneur |
| `backend/src/capabilities/**` | fusionné, modification par lot dédié | mainteneur |
| `src/features/life-project/**` | fusionné, extension par lot dédié | mainteneur |
| `src/router/AppRouter.tsx` | libre, intégration seulement | mainteneur |
| `src/pages/Dashboard.tsx` | libre | mainteneur |

## Capacités réellement livrées

- contrat et machine à états `makoki-life-project-v1` ;
- persistance MySQL transactionnelle et historique append-only ;
- API authentifiée derrière `LIFE_PROJECT_API_ENABLED=false` par défaut ;
- capacité publique au statut `experimental` lorsqu’elle est activée ;
- route frontend `/parcours` conditionnée par le registre des capacités ;
- triage initial, reprise, cache local en lecture seule et premières transitions explicites.

## Limites maintenues

- aucune efficacité scientifique ou terrain démontrée ;
- aucune activation de production décidée par ce registre ;
- aucune recommandation automatique de métier, formation ou pays dans le shell ;
- le triage est encore sérialisé en description déclarative, pas en faits structurés de provenance ;
- édition détaillée des scénarios, critères et plans encore incomplète ;
- cache local non canonique et non synchronisé entre appareils.

## Chantiers candidats de la Vague 2

```text
W2-A structurer le triage avec Fact/Hypothesis/Evidence
W2-B éditer scénarios, critères et plans d’action
W2-C orchestrer progressivement profil, RIASEC, compétences et parcours
W2-D préparer observation terrain, équité et accompagnement humain
```

Ces chantiers sont des candidats. Ils ne sont ni ouverts, ni assignés, ni implémentés par la clôture de la Vague 1.