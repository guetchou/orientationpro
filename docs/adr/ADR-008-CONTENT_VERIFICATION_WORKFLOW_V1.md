# ADR-008 — Workflow de vérification humaine v1

Statut : proposé pour V4-B

Issue : #98

Depends on #100.

## Décision

Le workflow `makoki-content-verification-v1` est append-only :

```text
draft → reviewed → verified → stale
  ↘ withdrawn       ↘ withdrawn
stale → reviewed ou withdrawn
```

Chaque transition porte un identifiant unique, un acteur humain ou une
autorité, une date, une raison et les preuves mobilisées. La promotion vers
`verified` exige au moins une preuve explicite et ne peut pas sauter la revue.

Les corrections relient l’ancienne et la nouvelle révision. Les désaccords et
signalements restent visibles et ouverts ; ils n’écrasent jamais le contenu.
Un signalement ou une correction sur un contenu vérifié le rend `stale`.

## Limites

- aucun écran, API ou stockage n’est activé ;
- le workflow ne décide pas qui est autorisé à tenir le rôle de relecteur ;
- aucune donnée réelle n’est incluse ;
- la résolution d’un désaccord sera traitée avec les permissions V4-E.
