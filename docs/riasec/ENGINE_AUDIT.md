# Audit des moteurs RIASEC

## Objectif

Garantir qu’une seule chaîne active calcule et persiste les Résultats d’orientation RIASEC.

## Matrice avant/après

| Élément | Avant | Après |
|---|---|---|
| API Auth V1 `/api/v1/orientation` | Active, versionnée | **Canonique et seule active** |
| `backend/src/orientation/riasec/scoring.js` | Moteur v1 | Moteur v2 + compatibilité v1 |
| `src/components/tests/riasec/RiasecAnalyzer.ts` | Analyseur navigateur concurrent, confiance fixe 85 | Supprimé |
| `src/data/riasecQuestions.ts` | Banque locale utilisée par l’analyseur concurrent | Supprimée |
| `POST /api/ats/tests/analyze` avec RIASEC | Analyse simplifiée, confiance par défaut | `410 LEGACY_RIASEC_RETIRED` |
| `POST /api/ats/tests/execute` avec RIASEC | Moteur industriel avec métriques non prouvées | `410 LEGACY_RIASEC_RETIRED` |
| `GET /api/ats/tests/available` | Annonce `riasec_professional` | Entrée RIASEC masquée |
| Fonctions Supabase historiques | Fichiers d’archive non montés par le routeur web canonique | Non actives ; suppression à traiter avec la migration Supabase globale |

## Preuve exécutable

La CI exécute :

```bash
node tests/verify-riasec-single-engine.cjs
```

Cette vérification confirme :

- la présence du moteur v2 ;
- le montage de l’API canonique ;
- l’utilisation de la page RIASEC canonique ;
- le blocage des deux chemins ATS historiques ;
- l’absence des deux fichiers concurrents frontend ;
- l’absence d’affirmation « scientifiquement validé » dans le README.

## Compatibilité historique

Les résultats déjà persistés conservent leur snapshot et leur `algorithmVersion`. Les tentatives v1 en cours peuvent encore être soumises avec `riasec-opc-scoring-v1`. Aucun résultat historique n’est recalculé ni réécrit.

## Travail différé

Les fichiers Supabase et services génériques non montés peuvent encore contenir des prototypes RIASEC. Leur suppression physique dépend de la migration globale hors Supabase. Ils ne constituent pas une source active du parcours `/tests/riasec`.
