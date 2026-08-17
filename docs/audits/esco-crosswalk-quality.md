# Audit qualité ESCO ↔ O*NET

## Objet

Ce contrôle distingue trois choses qui ne doivent pas être confondues :

1. le catalogue ESCO utilisé pour la présentation française ;
2. le catalogue O*NET utilisé pour les profils RIASEC et le classement ;
3. le crosswalk officiel O*NET ↔ ESCO utilisé pour relier une occupation O*NET à une présentation ESCO.

## Sources officielles vérifiées

- ESCO courant : v1.2.1, Commission européenne.
- Professions actives affichées par le portail ESCO v1.2.1 : 3 039.
- Compétences/connaissances affichées par le portail ESCO v1.2.1 : 13 939.
- Crosswalk officiel : Commission européenne, fichier O*NET–ESCO publié sur le portail ESCO.
- Méthodologie du crosswalk : génération de candidats par modèles de similarité sémantique, validation humaine ESCO, contrôle qualité par second validateur et arbitrage, puis validation/amélioration avec le U.S. Department of Labor.
- Relations qualifiées : `exact`, `narrow`, `broad`, `close`. Les `related` matches décrits par la Commission sont d'une qualité inférieure et n'ont pas suivi le même processus complet de validation ; ils ne doivent pas être promus silencieusement comme équivalents.

Références :

- https://esco.ec.europa.eu/en/classification/occupation_main
- https://esco.ec.europa.eu/en/classification/skill
- https://esco.ec.europa.eu/en/use-esco/other-crosswalks
- https://esco.ec.europa.eu/en/about-esco/publications/publication/crosswalk-between-esco-and-onet-technical-report

## Règle de confiance

Le fichier officiel actuellement importé ne fournit pas de score numérique de confiance exploitable par MAKOKI. Par conséquent :

- `confidence_score = NULL` est correct ;
- `confidence_level = unknown` signifie « aucun score numérique sourcé », pas « mapping non validé » ;
- MAKOKI ne doit jamais fabriquer un pourcentage ou convertir `unknown` en `low` ;
- la nature `exact/close/narrow/broad` est une relation sémantique, pas un score de confiance.

Le statut `official` signifie que la ligne vient du crosswalk publié par la Commission. `reviewed` est réservé à une décision locale explicitement revue. Une ligne `proposed` ne doit pas alimenter la présentation fiable.

## Décalage de versions

Le crosswalk public O*NET–ESCO a été construit lorsque la cible était ESCO v1.1, alors que la présentation française installée est ESCO v1.2.1. Les URI ESCO stables permettent de conserver de nombreuses liaisons, mais cette compatibilité ne doit pas être supposée complète.

L'audit doit donc mesurer la couverture réelle après import :

- occupations O*NET éligibles au matching ;
- occupations O*NET ayant au moins une cible ESCO française active ;
- occupations en fallback anglais ;
- cibles ESCO distinctes couvertes ;
- mappings pointant vers une occupation ESCO non active ;
- distribution `exact/close/narrow/broad` ;
- distribution des statuts de revue et des niveaux de confiance réellement sourcés.

## Commande d'audit

Depuis le backend configuré avec les mêmes variables MySQL que l'application :

```bash
node scripts/audit-esco-catalog.js
```

Le rapport est en JSON et ne modifie aucune donnée.

## Politique de décision

- Le classement RIASEC reste basé sur O*NET ; le crosswalk ne doit pas modifier silencieusement les six scores RIASEC.
- Une cible ESCO non active ne doit jamais être choisie pour la présentation.
- Un mapping `unknown` n'est pas pénalisé arbitrairement si son absence de score provient du format officiel.
- Une baisse de couverture après changement de source, version ou fichier doit être visible dans l'audit avant déploiement.
- Toute future pondération du classement par crosswalk doit faire l'objet d'une décision séparée, avec métriques de validation et tests de non-régression.
