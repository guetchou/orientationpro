# ADR 0004 — Référentiel métiers versionné et correspondance RIASEC explicable

- Statut : accepté pour implémentation
- Date : 2026-07-23
- Périmètre : Lot 2 MAKOKI

## Décision

MAKOKI utilisera deux sources officielles complémentaires :

1. **O*NET 30.3 Database** comme source primaire des profils numériques RIASEC par métier.
2. **ESCO 1.2.1** comme source multilingue pour les libellés français, les compétences, les descriptions et les mappings ISCO-08.

Le premier import porte sur O*NET 30.3, version épinglée. Il contient 1 016 professions. Les profils RIASEC directs sont disponibles pour 923 professions dans cette version. Les professions sans profil direct restent consultables mais sont exclues du classement RIASEC tant qu’aucun mapping traçable ou examen humain n’est disponible.

## Raisons

- O*NET fournit des valeurs numériques R, I, A, S, E et C, et non de simples étiquettes.
- ESCO fournit 3 039 professions et 13 939 compétences dans 28 langues, dont le français.
- Les deux sources sont téléchargeables, versionnées et accompagnées de conditions de réutilisation explicites.
- Une recommandation de métier doit pouvoir être reproduite sans appel à un modèle génératif.

## Licence et attribution

Les fichiers téléchargeables de la base O*NET 30.3 sont réutilisés sous licence CC BY 4.0. Toute publication utilisant ces données doit :

- créditer la base O*NET 30.3 et le U.S. Department of Labor, Employment and Training Administration ;
- indiquer les transformations réalisées par MAKOKI ;
- conserver la mention de marque O*NET® ;
- préciser que USDOL/ETA n’a ni approuvé ni testé les modifications MAKOKI.

Le logiciel de l’API locale ESCO est annoncé sous EUPL 1.2. Les données ESCO seront importées avec leur version, leur URI source et leurs mentions de réutilisation propres. L’import ESCO fera l’objet d’une validation juridique distincte avant publication.

## Modèle de données

Chaque import crée ou met à jour un `career_catalog_sources` immuable par source, version et langue. Chaque occupation conserve :

- son identifiant source ;
- sa version de catalogue ;
- son libellé et sa description ;
- ses six valeurs RIASEC normalisées ;
- son code d’affichage ;
- l’état de provenance du profil (`direct`, `mapped`, `reviewed`, `missing`) ;
- la preuve de transformation et la version de licence ;
- un statut séparé de pertinence locale pour le Congo.

Les traductions, synonymes, compétences, crosswalks et décisions de revue humaine sont stockés séparément afin de ne pas écraser la donnée source.

## Normalisation O*NET

L’importeur lit la plage de l’échelle `OI` directement depuis le fichier officiel `scales_reference.json`. La transformation vers 0–100 est :

```text
normalisé = (valeur brute - minimum) / (maximum - minimum) × 100
```

La valeur brute, la plage source, la date, le domaine source et la formule sont conservés dans la provenance JSON.

## Algorithme de correspondance v1

Le score de compatibilité combine :

- 80 % de similarité cosinus entre les deux vecteurs RIASEC à six dimensions ;
- 20 % d’accord pondéré entre les trois dimensions dominantes.

L’algorithme :

- ne force pas un code de trois lettres en cas d’égalité ;
- exclut les métiers sans profil RIASEC traçable ;
- renvoie les composantes du score ;
- n’utilise ni salaire, ni demande locale, ni promesse d’emploi non vérifiée ;
- est versionné sous `career-riasec-cosine-rank-v1`.

## Adaptation au Congo

Le score RIASEC mesure une proximité d’intérêts, pas la disponibilité réelle d’un emploi au Congo. La pertinence locale sera traitée dans une couche indépendante, alimentée par des sources nationales ou une revue éditoriale :

- existence du métier dans le contexte local ;
- appellations utilisées au Congo ;
- secteur public, privé, indépendant ou informel ;
- niveau d’études et voies de formation accessibles ;
- caractère réglementé ;
- perspectives locales documentées.

Aucun métier ne sera exclu ou favorisé automatiquement sur la base d’une supposition géographique.

## Garde-fous d’import

- version O*NET épinglée ;
- empreinte SHA-256 des trois fichiers sources ;
- refus d’un changement silencieux d’une version déjà importée ;
- seuil minimal de 1 000 professions ;
- seuil minimal de 900 profils RIASEC directs ;
- import idempotent ;
- conservation des annotations locales lors d’un nouvel import identique ;
- aucun import automatique au démarrage de l’API.

## Étapes suivantes

1. Valider migration, rollback et import O*NET sur MySQL jetable.
2. Ajouter l’API de recherche et de classement par résultat RIASEC.
3. Importer les synonymes O*NET.
4. Importer ESCO français et ses compétences.
5. Construire le crosswalk O*NET ↔ ESCO avec niveaux de confiance et revue humaine.
6. Créer l’interface métiers, comparaison et justification des recommandations.
7. Ajouter la couche de pertinence Congo et les parcours de formation.

## Sources officielles

- https://www.onetcenter.org/database.html
- https://www.onetcenter.org/license_db.html
- https://www.onetcenter.org/dictionary/30.3/json/occupation_data.html
- https://www.onetcenter.org/dictionary/30.3/json/career_interest_types.html
- https://esco.ec.europa.eu/en/about-esco/what-esco
- https://esco.ec.europa.eu/en/use-esco/download
