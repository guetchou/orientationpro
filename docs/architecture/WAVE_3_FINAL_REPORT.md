# Rapport de clôture technique — Vague 3

## Décision

**GO limité à la fusion technique.** L’activation publique reste interdite et
les feature flags restent désactivés par défaut.

## Périmètre validé

Le parcours couvert est : création → clarification → scénario → plan → action
→ blocage → reprise → réorientation. Les tests API vérifient les transitions,
la sélection provisoire, le suivi d’action, le blocage et le rejet des versions
obsolètes. Les tests de synchronisation vérifient la file hors ligne,
l’isolation entre projets, l’interruption réseau simulée, la liaison lente et
la reprise sans perte. Les tests MySQL couvrent l’isolation des comptes.

## Limites

- aucune validation d’impact utilisateur ou scientifique n’est revendiquée ;
- aucun métier idéal, score de réussite ou contenu local inventé n’est produit ;
- un résultat de CI prouve seulement l’exécution des contrôles rattachés au SHA ;
- l’activation publique nécessite une décision distincte du mainteneur.

## Rollback

Le lot ne contient ni migration ni modification de workflow. Le rollback
consiste à revenir le commit de la PR V3-E ; les lots V3-A à V3-D restent
indépendamment fusionnés.
