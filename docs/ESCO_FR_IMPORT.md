# Import ESCO français — procédure traçable

## Source retenue

- Classification : ESCO, version stable `1.2.1`.
- Langue importée : `fr`.
- Page officielle : `https://esco.ec.europa.eu/en/use-esco/download`.
- Date d’accès documentaire : `2026-07-28`.
- Licence de réutilisation documentée pour les contenus ESCO : Creative Commons Attribution 4.0 International.
- Crosswalk officiel O*NET–ESCO : `https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv`.
- Rapport technique : `https://esco.ec.europa.eu/en/about-esco/publications/publication/crosswalk-between-esco-and-onet-technical-report`.

Le téléchargement du paquet officiel nécessite d’accepter les informations de confidentialité et de fournir une adresse électronique sur le site ESCO. Le dépôt ne contient donc ni archive ESCO, ni URL privée reçue par courriel.

## Fichiers utilisés

Le paquet CSV doit contenir :

- `occupations_fr.csv` ;
- `skills_fr.csv` ;
- `occupationSkillRelations.csv` ou `occupationSkillRelations_fr.csv`.

Le crosswalk O*NET–ESCO est lu séparément. Les URI ESCO sont les clés de jointure. L’importeur consigne dans `career_catalog_sources.metadata_json` le nom et le SHA-256 de chaque fichier réellement utilisé, les volumes et la date d’accès.

## Variables

Voir `.env.example`. Au minimum :

```env
ESCO_ARCHIVE_PATH=/chemin/vers/le-paquet-esco-ou-son-dossier-extrait
ESCO_CROSSWALK_PATH=/chemin/vers/ONET_ESCo.csv
ESCO_ACCESS_DATE=2026-07-28
```

`ESCO_ARCHIVE_URL` et `ESCO_CROSSWALK_URL` peuvent remplacer les chemins. Les téléchargements utilisent des délais d’attente, des tentatives bornées et un cache. Aucune variable n’est un secret applicatif.

## Commandes hors production

```bash
npm --prefix backend ci
npm --prefix backend run migrate:up
npm --prefix backend run import:esco
npm --prefix backend run test:career
```

L’import n’est jamais exécuté au démarrage de l’API. Ne pas lancer cette commande sur la base de production sans lot de déploiement explicitement autorisé.

## Garde-fous

- seuils par défaut : au moins 2 900 professions et 13 000 compétences ;
- transaction unique et rollback en cas d’échec ;
- refus d’une empreinte différente pour `esco:1.2.1:fr`, sauf revue explicite avec `ALLOW_SOURCE_REPLACE=true` ;
- mise à jour limitée aux données source ESCO ;
- conservation des notes de pertinence locale, alias `local` et décisions de crosswalk `reviewed`/`rejected` ;
- aucune confiance numérique inventée ;
- aucun statut `validated` implicite.

## Recette

1. Importer O*NET 30.3 sur un MySQL 8 jetable.
2. Importer le paquet ESCO 1.2.1 français et le crosswalk officiel.
3. Conserver le rapport JSON de l’import : empreinte combinée, volumes et distribution des niveaux de confiance.
4. Rechercher `infirmier`, `comptable` et `ingénieur` avec `locale=fr`.
5. Vérifier que le libellé et la description viennent d’ESCO, tandis que l’identifiant, le code et les scores RIASEC viennent d’O*NET.
6. Ouvrir une occupation sans crosswalk et vérifier `translationStatus=unavailable` et `fallbackLocale=en`.
7. Vérifier les permissions, l’isolation des Comptes et le viewport mobile 390 × 844.

## Limites connues

Le code et les fixtures automatisées valident le parsing, les garde-fous, la transaction, la restitution française et le repli. Tant qu’un paquet officiel n’a pas été fourni à l’environnement de recette, les volumes réels importés et le nombre réel de correspondances ne sont pas validés. MAKOKI ne doit pas annoncer que tous les métiers sont traduits : seuls les métiers rapprochés par une liaison officielle ou revue sont servis en français.
