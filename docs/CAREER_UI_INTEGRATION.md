# Interface métiers MAKOKI — Lot 2.2

## Objectif

Relier un résultat RIASEC persistant au catalogue professionnel importé par la PR #13 et exposer une expérience utilisateur traçable :

- recommandations directement dans la page de résultat ;
- classement complet des métiers ;
- recherche dans le catalogue ;
- fiche métier avec profil RIASEC, source et licence.

## Routes frontend

- `/orientation/results/:resultId` : résultat RIASEC avec six premières recommandations ;
- `/orientation/results/:resultId/careers` : cinquante premières correspondances ;
- `/careers` : recherche et pagination dans le catalogue ;
- `/careers/:occupationId` : fiche métier détaillée.

Toutes les routes sont protégées par `UserRoute` et reposent sur les permissions serveur :

- `career.catalog.read` ;
- `career.match.read_own`.

## API consommée

- `GET /api/v1/career/catalog/summary` ;
- `GET /api/v1/career/occupations` ;
- `GET /api/v1/career/occupations/:occupationId` ;
- `GET /api/v1/career/matches/:resultId`.

Le `resultId` n'est jamais utilisé sans le contrôle de propriété côté serveur.

## Lecture du score

L'interface expose séparément :

- le score final de proximité ;
- la similarité cosinus sur les six dimensions ;
- l'accord entre les intérêts dominants ;
- le code RIASEC du métier ;
- la provenance du profil métier.

Les libellés de présentation sont descriptifs :

- 90–100 : très forte proximité ;
- 75–89,99 : forte proximité ;
- 60–74,99 : proximité à explorer ;
- moins de 60 : piste secondaire.

Ces classes ne sont ni des probabilités d'embauche, ni des seuils psychométriques validés.

## Transparence des contenus

Le premier catalogue est O*NET 30.3 en anglais. L'interface :

- affiche les titres et descriptions sources sans traduction générative ;
- signale explicitement la langue anglaise ;
- affiche la version, la licence et l'attribution ;
- signale que la pertinence Congo reste à examiner ;
- n'affiche pas de compétences fictives lorsque la table ESCO est vide.

## États gérés

- chargement ;
- erreur d'authentification ou de permission ;
- résultat introuvable ou non détenu ;
- métier introuvable ;
- catalogue vide ;
- métier sans profil RIASEC ;
- compétences et alias encore absents.

## Variables de recette

```env
AUTH_V1_ENABLED=true
RIASEC_API_ENABLED=true
RIASEC_ALLOW_DRAFT=true
CAREER_API_ENABLED=true
```

La base de recette doit contenir :

- les migrations 001 à 004 ;
- l'instrument RIASEC seedé ;
- le catalogue O*NET 30.3 importé ;
- un compte actif disposant des permissions utilisateur ;
- au moins un résultat RIASEC appartenant à ce compte.

## Scénario fonctionnel obligatoire

1. Se connecter avec un compte utilisateur actif.
2. Ouvrir un résultat RIASEC appartenant au compte.
3. Vérifier l'affichage des six recommandations.
4. Ouvrir le classement complet.
5. Ouvrir une fiche métier depuis le classement.
6. Revenir au catalogue et rechercher un terme anglais connu.
7. Activer le filtre « profil RIASEC classable ».
8. Vérifier qu'un résultat d'un autre compte reste inaccessible.
9. Vérifier que la licence et l'attribution O*NET sont visibles.
10. Vérifier l'affichage mobile à 390 × 844.

## Hors périmètre de cet incrément

- traduction française ESCO ;
- import des compétences ESCO ;
- validation Congo métier par métier ;
- formations, établissements et débouchés locaux ;
- comparaison multi-métiers ;
- favoris ;
- export PDF ;
- administration éditoriale du catalogue.
