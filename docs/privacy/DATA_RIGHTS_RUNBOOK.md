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

La primitive `buildPortableExport` produit le format
`makoki.portable-export.v2`. Elle contrôle la propriété au point d'entrée puis
applique un sérialiseur allowlisté propre à chaque entité (compte, profil,
projets, scénarios, plans, actions et résultats d'orientation). Des canaris
négatifs vérifient que tokens, champs internes et documents bruts ne traversent
pas l'export. La pseudonymisation HMAC est testée.

Non validé : endpoint authentifié, export MySQL complet, correction,
suppression/anonymisation transactionnelle et propagation aux sauvegardes. Ces
éléments restent des gates `no-go`, pas des capacités annoncées.
