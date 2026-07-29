# Déploiement progressif et rollback

## Préconditions

1. PR V3 et V4 fusionnées et gates documentés.
2. CI, MySQL, smoke et preflights verts.
3. Sauvegarde cohérente créée et checksum vérifié.
4. Migration `up` puis `down` prouvée sur clone isolé.
5. Mainteneur explicitement favorable à l'activation.

## Séquence

1. Déployer l'image immuable sans activer de flag.
2. Vérifier santé, erreurs, latence et migrations.
3. Activer uniquement en préproduction interne.
4. Si autorisé, cohorte production minimale et réversible.
5. Étendre seulement après fenêtre d'observation documentée.

L'arrêt d'urgence consiste à remettre les flags à `false`, sans supprimer de
données. Le clic sur un bouton, un déploiement terminé ou une page accessible ne
prouve aucun impact.

## Rollback

1. Désactiver les flags.
2. Stopper les nouvelles écritures du lot ciblé, sans arrêter les services
   globaux.
3. Revenir à l'image précédente immuable.
4. Si et seulement si la migration est incompatible, appliquer son `down` sur
   un clone restauré, valider, puis suivre la procédure coordonnée.
5. Vérifier santé, ports, logs expurgés et parcours critiques.

Rollback de cette PR : revenir à son commit parent. Aucun script n'est appelé
automatiquement et aucun flag n'est activé.

Preuve jetable du cycle contrôlé :

```bash
npm --prefix backend ci
scripts/release/test-migration-rollback.sh
```

Le test crée une sauvegarde préalable, applique toutes les migrations, annule
la dernière, la réapplique et compare exactement la liste des versions.
