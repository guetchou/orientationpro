# Life Project

Ce module contient les contrats `makoki-life-project-v1`, la machine à états et la persistance MySQL du projet de vie.

La persistance est interne au backend. Elle n’active aucune API publique et ne doit pas être interprétée comme une capacité utilisateur disponible.

## Store

```js
const { createLifeProjectStore } = require('./store');
const store = createLifeProjectStore(pool);
```

Opérations disponibles :

- `create(project)` : création transactionnelle, version de persistance `1` ;
- `get(accountId, projectId)` : lecture strictement limitée au propriétaire ;
- `list(accountId)` : résumés des projets du compte ;
- `save(project, { expectedVersion })` : mise à jour transactionnelle avec verrouillage optimiste et historique append-only.

Le store attend des objets valides selon `createLifeProject`. Les transitions doivent être produites par la machine à états avant l’appel à `save`.