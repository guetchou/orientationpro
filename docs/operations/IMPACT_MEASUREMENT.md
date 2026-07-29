# Mesure d'usage et d'impact V5-E

## Trois niveaux à ne pas confondre

1. **Métriques produit** : démarrage, complétion, reprise, blocage,
   réorientation, actions créées et réalisées.
2. **Résultats intermédiaires** : une personne a formulé un scénario, engagé une
   action ou sollicité un accompagnement. Ces faits restent descriptifs.
3. **Impact** : changement attribuable au dispositif. Aucune causalité ne peut
   être publiée sans protocole, comparaison appropriée, suivi et analyse des
   biais.

Les clics ne figurent pas dans le vocabulaire : ils ne prouvent ni compréhension,
ni décision, ni action réelle.

## Cohortes et données manquantes

Chaque cohorte possède un identifiant borné, une période, des critères
d'inclusion, un canal de consentement et une version du parcours. Le rapport
publie effectif éligible, événements observés, données manquantes et taux de
données manquantes. Une cohorte vide produit `null`, pas un faux taux de 0 %.

Les écarts entre groupes sont exploratoires tant que taille, sélection,
attrition, mesure et facteurs de confusion ne sont pas traités.

## Arrêt et recours

La personne peut arrêter la mesure sans perdre le parcours essentiel, demander
un accompagnement humain et corriger une information. La télémétrie analytique
reste OFF par défaut et séparée de la télémétrie essentielle.
