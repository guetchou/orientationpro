# Export, correction, suppression et anonymisation

## Principes

- authentifier le demandeur sans collecter une copie documentaire inutile ;
- enregistrer la demande sans inclure les données demandées dans les logs ;
- vérifier les dépendances, obligations de conservation et comptes liés ;
- fournir un export versionné, lisible et sécurisé ;
- corriger à la source canonique et historiser sans conserver l'ancienne valeur
  au-delà du besoin prouvé ;
- supprimer ou anonymiser selon la règle validée, puis vérifier les index,
  caches, fichiers et sauvegardes selon leur calendrier ;
- permettre recours et correction humaine.

## État de preuve

La primitive `buildPortableExport` est testée : allowlist du Compte, copie
détachée et version du format. La pseudonymisation HMAC est testée.

Non validé : endpoint authentifié, export MySQL complet, correction,
suppression/anonymisation transactionnelle et propagation aux sauvegardes. Ces
éléments restent des gates `no-go`, pas des capacités annoncées.
