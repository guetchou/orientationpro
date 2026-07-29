# ADR 0008 — Résultat RIASEC v2 et moteur unique

- Statut : accepté
- Date : 2026-07-29
- Décideurs : équipe MAKOKI

## Contexte

Le dépôt contenait un moteur RIASEC canonique côté serveur, mais aussi des implémentations historiques : analyseur navigateur, endpoints ATS et service de tests publiant des métriques de confiance, fiabilité, validité, percentiles et prédictions sans protocole démontrable.

Le moteur canonique savait déjà normaliser séparément chaque dimension et détecter certaines égalités. Il restait toutefois sous une version `v1`, utilisait un ordre alphabétique dans les groupes égaux et ne déclarait pas explicitement l’absence de base normative.

## Décision

### Moteur canonique

La seule implémentation active est :

```text
backend/src/orientation/riasec/scoring.js
/api/v1/orientation
```

La version courante est `riasec-makoki-scoring-v2` et le schéma de sortie est `riasec-result-v2`.

### Règles de classement

1. Les six scores sont normalisés indépendamment sur 0–100 selon le nombre d’items de chaque dimension.
2. Les scores égaux restent dans un même groupe.
3. L’ordre interne d’un groupe suit l’ordre canonique `R-I-A-S-E-C` uniquement pour l’affichage ; il ne départage pas l’égalité.
4. Un `primaryCode` à trois lettres n’est émis que lorsque les trois premiers rangs sont univoques.
5. Sinon, `primaryCode` vaut `null` et `displayCode` expose toutes les alternatives, par exemple `R/I-A` ou `R-I-A/S`.
6. Une égalité des six scores produit `R/I/A/S/E/C`.

### Différenciation

La plage et l’écart-type des six scores sont des indicateurs descriptifs de dispersion. Ils ne sont jamais appelés confiance, fiabilité ou validité.

Le résultat v2 expose :

```json
{
  "kind": "descriptive",
  "range": 0,
  "standardDeviation": 0,
  "normativeBasis": null,
  "percentile": null
}
```

Aucun percentile ne sera ajouté sans population normative, méthode d’échantillonnage et protocole documentés.

### Instrument

La banque `riasec-makoki-fr-draft-v2` est originale au projet. Elle ne reproduit ni n’adapte les items O*NET. Elle reste `draft` jusqu’à revue métier, prétest de compréhension, décision de licence et protocole de validation.

O*NET demeure une référence méthodologique et un référentiel de métiers/intérêts. Ses résultats publiés ne sont pas transposés à l’instrument MAKOKI.

### Compatibilité

`riasec-opc-scoring-v1` reste supporté uniquement pour terminer de façon reproductible une tentative v1 déjà créée. Les résultats v1 persistés restent immuables et lisibles. Toute nouvelle tentative utilise l’instrument v2 et le moteur v2.

### Retrait des concurrents

- suppression de l’analyseur RIASEC navigateur et de sa banque locale ;
- réponse `410 LEGACY_RIASEC_RETIRED` pour les chemins ATS historiques RIASEC ;
- retrait du RIASEC de la liste des tests ATS disponibles ;
- vérification CI `tests/verify-riasec-single-engine.cjs`.

## Conséquences

### Positives

- résultats reproductibles et explicables ;
- égalités non arbitraires ;
- absence d’affirmation scientifique non démontrée ;
- compatibilité avec l’historique ;
- source de vérité unique pour le web et les futurs clients.

### Limites

- l’instrument n’est pas psychométriquement validé ;
- les scores ne sont pas normatifs ;
- l’interprétation reste un support d’exploration, non un diagnostic ;
- une publication `pilot` ou `active` nécessitera une nouvelle décision documentée.
