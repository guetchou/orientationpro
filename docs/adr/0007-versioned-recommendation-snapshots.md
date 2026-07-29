# ADR 0007 — Stabilisation internationale ESCO/O*NET et snapshots immuables

- Statut : implémenté
- Date : 2026-07-29
- Périmètre : moteur international de recommandations métiers

## Contexte

Le moteur `career-profile-context-v1` combinait le RIASEC O*NET, les compétences ESCO confirmées et un repère de préparation fondé sur les Job Zones. Il interprétait toutefois toutes les Job Zones avec une table historique à cinq niveaux.

O*NET a remplacé cette structure à partir de la version 30.2 par quatre catégories. La valeur numérique `2` désigne désormais la catégorie fusionnée « Job Zone 1-2 ». La version de production actuelle, O*NET 30.3, conserve les valeurs `2`, `3`, `4` et `5`.

Par ailleurs, un classement recalculé après une modification du profil, de l’algorithme ou des catalogues peut légitimement changer. Un rapport ou une décision passée ne doit donc pas être réinterprété silencieusement avec de nouvelles données.

## Décision

### Référentiels

ESCO et O*NET restent les référentiels canoniques. Aucun catalogue national, salaire, débouché local ou règle d’équivalence nationale n’entre dans ce lot.

- O*NET porte les profils RIASEC et le signal Job Zone.
- ESCO porte les libellés multilingues, compétences et relations métier-compétence.
- Les crosswalks officiels ou revus relient les deux couches.

### Adaptateur Job Zone

Le module `onet-job-zone-adapter-v1` sélectionne le framework selon la version de la source O*NET :

| Version O*NET | Framework | Valeurs admises |
|---|---|---|
| jusqu’à 30.1 | cinq niveaux historiques | 1, 2, 3, 4, 5 |
| à partir de 30.2 | quatre catégories | 2, 3, 4, 5 |

Une version non reconnue ou une valeur incompatible n’est jamais devinée. Le composant de préparation reçoit alors un score neutre et expose explicitement la raison.

### Version du classement

Le moteur devient `career-profile-context-v2`. Chaque réponse expose :

- version du moteur de recommandation ;
- version du résultat RIASEC ;
- version de l’adaptateur Job Zone ;
- manifestes O*NET et ESCO avec identifiant, version et empreinte de contenu ;
- empreinte sémantique du profil ;
- empreinte complète des entrées du classement ;
- date du calcul dynamique.

L’empreinte du profil est calculée sur les données sémantiques triées : profil général, études et compétences ESCO confirmées. Les identifiants techniques et l’ordre de retour SQL ne la modifient pas.

### Snapshots immuables

La table `career_recommendation_snapshots` stocke le JSON complet du classement et sa provenance. Une combinaison identique d’entrées produit le même snapshot. Un changement de profil, de catalogue, de version d’algorithme, de locale ou de limite produit une nouvelle empreinte et donc un nouvel instantané.

Les seules opérations exposées sont :

```text
POST /api/v1/career/recommendations/:resultId/snapshots
GET  /api/v1/career/recommendation-snapshots/:snapshotId
```

Aucune route de mise à jour ou suppression n’est fournie. La propriété vient exclusivement du compte authentifié. Un snapshot appartenant à un autre compte répond comme un snapshot inexistant.

## Validation

Les contrôles couvrent :

- modèles Job Zone historiques et actuels ;
- refus de deviner une version inconnue ;
- stabilité des empreintes face à l’ordre des données ;
- changement d’empreinte après modification du profil ou du catalogue ;
- idempotence d’un snapshot identique ;
- immuabilité du JSON relu ;
- isolation entre deux comptes ;
- parcours authentifié complet avec profil, RIASEC, ESCO, recommandation et snapshot dans GitHub Actions.

## Conséquences

- Les anciens classements dynamiques restent recalculables mais ne deviennent historiques qu’après création d’un snapshot.
- Le futur rapport individuel devra référencer un `snapshotId` plutôt que recalculer un classement.
- Une future version O*NET nécessitant un autre modèle de préparation sera ajoutée dans l’adaptateur sans modifier les snapshots existants.
- Les extensions régionales éventuelles resteront facultatives et séparées du noyau ESCO/O*NET.
