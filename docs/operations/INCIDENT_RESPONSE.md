# Réponse à incident

1. Détecter et ouvrir un identifiant d'incident sans donnée personnelle.
2. Qualifier portée, début estimé, disponibilité et risque de confidentialité.
3. Contenir : flags à `false`, cohorte suspendue, écritures ciblées stoppées.
4. Préserver les preuves techniques expurgées et limiter leur accès.
5. Restaurer via image connue, rollback contrôlé ou sauvegarde testée.
6. Vérifier les parcours critiques et la non-récurrence.
7. Communiquer faits vérifiés, hypothèses, inconnues et prochaine mise à jour.
8. Produire un post-mortem sans blâme : chronologie, cause, détection,
   conséquences prouvées, correctifs, propriétaires et échéances.

Une page revenue au vert clôt l'indisponibilité observée ; elle ne prouve pas
que toutes les personnes affectées ont récupéré leur état.
