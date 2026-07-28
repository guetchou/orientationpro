# Interface métiers MAKOKI — O*NET RIASEC et ESCO français

## Objectif

Relier un Résultat d’orientation persistant au catalogue professionnel versionné et exposer une expérience française traçable : recommandations, classement, recherche et fiche métier.

## Sources distinctes

- **O*NET 30.3** : identifiant fonctionnel du métier, code O*NET, six scores et code RIASEC.
- **ESCO 1.2.1 français** : libellé, description, synonymes et compétences lorsqu’un crosswalk officiel ou revu existe.

L’interface ne recalcule jamais le RIASEC avec ESCO et ne présente pas un rapprochement proposé comme certain.

## Routes et permissions

- `/orientation/results/:resultId` : six premières recommandations ;
- `/orientation/results/:resultId/careers` : classement complet ;
- `/careers` : recherche française et pagination ;
- `/careers/:occupationId` : fiche détaillée.

Les routes restent protégées par `UserRoute`; le serveur vérifie `career.catalog.read`, `career.match.read_own` et la propriété du Résultat d’orientation.

## API consommée

- `GET /api/v1/career/catalog/summary` ;
- `GET /api/v1/career/occupations?locale=fr&q=infirmier` ;
- `GET /api/v1/career/occupations/:occupationId?locale=fr` ;
- `GET /api/v1/career/matches/:resultId?locale=fr`.

Champs de transparence :

- `requestedLocale` : langue demandée ;
- `locale` : langue réellement servie ;
- `translationStatus` : `available`, `native` ou `unavailable` ;
- `fallbackLocale=en` lorsque le français manque ;
- `presentationSource` : source descriptive ;
- `riasecSource` : source du profil d’intérêts ;
- `crosswalk` : méthode, confiance, statut de revue et provenance.

## Stratégie de repli

```text
fr demandé
→ ESCO fr via crosswalk official/reviewed
→ sinon O*NET en + translationStatus=unavailable + fallbackLocale=en
```

L’interface affiche sobrement « Anglais par défaut » uniquement sur les fiches concernées. Elle ne montre plus un avertissement global affirmant que tous les contenus sont en anglais lorsque ESCO est disponible.

## Lecture du score

Le score combine la similarité cosinus RIASEC et l’accord des dimensions dominantes selon `career-riasec-cosine-rank-v1`. Les bandes d’affichage ne sont ni des probabilités d’embauche, ni des seuils psychométriques validés.

## Variables de recette

```env
AUTH_V1_ENABLED=true
RIASEC_API_ENABLED=true
RIASEC_ALLOW_DRAFT=true
CAREER_API_ENABLED=true
ESCO_VERSION=1.2.1
ESCO_LOCALE=fr
ESCO_ARCHIVE_PATH=/data/esco/csv
ESCO_CROSSWALK_PATH=/data/esco/ONET_ESCO.csv
ESCO_ACCESS_DATE=2026-07-28
```

La base jetable doit contenir les migrations 001 à 006, l’instrument RIASEC, O*NET 30.3, ESCO français, un Compte actif et au moins un Résultat d’orientation lui appartenant.

## Recette fonctionnelle

1. Rechercher `infirmier`, `comptable` et `ingénieur`.
2. Vérifier qu’au moins une fiche rapprochée affiche un libellé, une description, des synonymes et des compétences en français.
3. Vérifier que le code O*NET et les scores RIASEC restent présents.
4. Vérifier les attributions O*NET et ESCO séparément.
5. Vérifier une fiche sans français : contenu anglais, `fallbackLocale=en`, indicateur visible.
6. Vérifier qu’un Résultat d’orientation appartenant à un autre Compte reste inaccessible.
7. Vérifier l’absence d’erreur React et de débordement horizontal à 390 × 844.

## Limites

- seuls les métiers disposant d’un crosswalk officiel ou revu sont servis en français ;
- `official` ne vaut pas revue locale Congo ;
- les volumes et la couverture réels doivent être consignés après import du paquet officiel ;
- formations, débouchés locaux et administration éditoriale restent hors de cet incrément.
