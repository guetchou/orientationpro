# Registre de livraison — Vague 4

Statut : actif, aucune activation production

Issue : #98

| ID | Lot | État | Dépend de | Chemins réservés |
|---|---|---|---|---|
| V4-A | Registre de contenus et provenance | active | provenance v1 (#84) | `backend/src/content-registry/**`, tests et ADR-007 |
| V4-B | Workflow de vérification humaine | blocked | V4-A | `backend/src/content-registry/**` |
| V4-C | Protocole terrain | ready | aucun runtime | `docs/field-validation/**` |
| V4-D | Équité, accessibilité et sécurité humaine | ready | aucun runtime | `docs/equity/**` |
| V4-E | Accompagnement humain | blocked runtime | V3-A et contrats V4-A/B | `backend/src/guidance/**`, `src/features/guidance/**` |

## Invariants

- aucun contenu local inventé ;
- aucune source institutionnelle assimilée automatiquement à une réalité vécue ;
- source, date, périmètre, version, licence, fraîcheur et vérification obligatoires ;
- promotion `verified` uniquement par décision humaine historisée ;
- équivalences et reconnaissances non confirmées laissées inconnues ou proposées ;
- feature flags inactifs et aucune activation production ;
- aucun changement dans les modules LifeProject avant stabilisation de V3-A.
