---
status: accepted
---

# Résultats RIASEC versionnés et calculés côté serveur

## Contexte

Le dépôt contenait plusieurs banques de questions et moteurs RIASEC concurrents. Le navigateur calculait directement les scores, enregistrait vers une interface Supabase et ajoutait un indice de confiance fixe. Une autre implémentation backend annonçait des coefficients de fidélité et de validité sans protocole démontrable. La page de résultats pouvait afficher des données fictives.

Un Résultat d’orientation doit être reproductible, privé et associé à la banque d’items ainsi qu’à la méthode de calcul réellement utilisées.

## Décision

- MySQL est la source de vérité des instruments, items, passations, réponses et Résultats d’orientation.
- Le score final est calculé côté serveur par un moteur pur et versionné.
- L’API refuse explicitement un instrument dont la version de calcul n’est pas supportée ; elle ne substitue jamais silencieusement un autre algorithme.
- Le navigateur reçoit le texte et l’ordre des items, mais pas leur dimension ni leur clé d’inversion.
- Chaque dimension est normalisée indépendamment selon son propre nombre d’items.
- Une égalité n’est jamais départagée par l’ordre accidentel d’un tableau. Le code principal à trois lettres reste nul lorsque les premiers rangs sont ambigus ; un code d’affichage explicite les groupes d’égalité.
- La dispersion des six scores et le motif descriptif des réponses sont conservés. Ils ne sont pas appelés « confiance », « fidélité », « validité » ou « percentile ».
- L’empreinte de l’instrument couvre notamment l’échelle de réponse, les descriptions des six dimensions, la méthodologie, la provenance, les avertissements, la version de calcul et tous les items.
- Le résultat stocke l’identifiant et l’empreinte du contenu de l’instrument, la version de l’algorithme et un instantané destiné aux rapports futurs.
- L’IA ne produit ni ne modifie les scores. Elle pourra seulement reformuler une explication déjà déterminée, dans un lot séparé et identifiable.
- La banque initiale est une rédaction originale Orientation Pro Congo avec le statut `draft`. Elle ne peut être rendue `pilot` ou `active` sans revue humaine documentée.
- Aucune partie de la clé de correction propriétaire IPH-T n’est copiée.

## Échelle et transformation

Chaque réponse est un entier de 1 à 5. Pour un item inversé, la valeur ajustée est `6 - réponse`. Pour une dimension contenant `n` items, la somme minimale vaut `n` et la somme maximale `5n`. Le score descriptif est :

```text
100 × (somme ajustée - n) / (5n - n)
```

Cette transformation place une réponse moyenne de 3 à 50. Elle ne constitue pas un percentile et n’utilise aucune population normative.

## Conséquences

- Une migration et un seed explicite sont nécessaires avant d’activer l’API.
- Un instrument publié ou pilote ne peut plus être modifié en place ; une nouvelle version doit être créée.
- Les anciens moteurs et écrans simulés ne seront supprimés qu’après remplacement fonctionnel et tests de non-régression.
- Une étude ultérieure devra examiner compréhension, cohérence interne, biais culturels et qualité des recommandations avant toute revendication psychométrique.
