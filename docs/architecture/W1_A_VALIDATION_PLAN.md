# Plan de validation W1-A

## Tests déterministes

- contrats et machine à états existants ;
- historique append-only ;
- ordre chronologique des événements ;
- conflit de version optimiste.

## Tests MySQL

- migration 011 sur une base à jour ;
- création transactionnelle du graphe complet ;
- lecture strictement limitée au propriétaire ;
- sélection active garantie par clé étrangère composite ;
- mise à jour des scénarios, plans et actions ;
- ajout d’événements sans réécriture du préfixe ;
- rollback intégral lorsqu’un enfant entre en collision ;
- migration descendante 011, vérification de suppression, puis remontée.

## Régressions obligatoires

- suite backend complète ;
- suite MySQL complète ;
- syntaxe JavaScript ;
- RIASEC actif unique ;
- parcours carrière, hypothèses et synthèse authentifiés ;
- typecheck, lint, tests frontend, build et smoke navigateur ;
- Release Preflight et Wrapper.

Une CI verte valide l’intégration technique du lot. Elle ne valide ni l’efficacité du Parcours MAKOKI, ni les recommandations, ni un usage terrain.