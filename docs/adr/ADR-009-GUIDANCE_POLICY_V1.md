# ADR-009 — Politique d’accompagnement humain v1

Statut : accepté après correction chronologique

Date : 2026-07-29

Périmètre : contrats backend uniquement

Activation production : aucune

L’accès est fermé par défaut. Un conseiller ou un coach doit avoir une
attribution active, une permission serveur explicite et un consentement actif
du bénéficiaire.

Seul le bénéficiaire accorde ou révoque ce consentement. Chaque décision est
append-only et historise explicitement l’acteur, la date, le périmètre, la
décision et le motif. Un nouvel horodatage doit être strictement supérieur à
celui de la dernière décision enregistrée. Tout accord retardé ou rejoué après
une révocation est rejeté, et la révocation reste la décision effective.

Les interventions acceptent aussi deux décisions humaines explicites :
`confirmation` et `rejection`. Elles produisent respectivement les décisions
immuables `confirmed` et `rejected`, avec acteur, date, périmètre et motif. Les
interventions restent des propositions, commentaires ou décisions de revue et
ne remplacent jamais la parole de la personne.

Ce module ne prouve pas à lui seul l’identité de l’acteur : l’authentification,
l’attribution et la permission restent des préconditions vérifiées par
l’appelant au moyen de `authorizeGuidance`.

Ce lot n’ajoute ni route, ni table, ni branchement Life Project, ni feature flag
actif, ni donnée ou contact local réel.
