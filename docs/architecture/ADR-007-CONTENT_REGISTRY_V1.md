# ADR-007 — Registre de contenus vérifiables v1

Statut : proposé pour V4-A

Issue : #98

## Décision

Le module pur `backend/src/content-registry/**` définit le contrat
`makoki-content-registry-v1`. Il couvre pays, systèmes éducatifs, diplômes,
formations, établissements, métiers, compétences, passerelles, autorités et
professions réglementées.

V4-A ne contient aucune donnée locale. Le registre livré est vide et inactif.
Une fixture synthétique de test ne constitue pas un contenu exploitable.

Chaque enregistrement exige :

- une source classée internationale, nationale, locale ou déclaration ;
- un responsable, une licence, une version et une date de récupération ;
- une langue et un périmètre géographique explicites, y compris `unknown` ;
- un état de fraîcheur avec date de contrôle ;
- un statut de vérification initial `draft` ;
- des assertions optionnelles conformes à `EvidenceV1`, `HypothesisV1` et
  `FactV1`.

## Garde-fous

1. Aucun contenu n’est créé directement comme `verified`.
2. Une déclaration utilisateur ne peut pas se présenter comme une autorité.
3. Une zone nationale ou locale exige des codes géographiques explicites.
4. Une absence de donnée reste `unknown`.
5. Une équivalence, reconnaissance, admission ou autorisation confirmée exige
   un `FactV1` correspondant, confirmé par un acteur `authority`.
6. Une confirmation humaine d’hypothèse ne remplace pas l’autorité compétente.
7. Aucune API, persistance, capacité ou activation production n’est ajoutée.

## Suite

V4-B ajoutera les transitions historisées
`draft → reviewed → verified → stale → withdrawn` et le signalement. Les lots
runtime restent dépendants de la stabilisation de V3-A.
