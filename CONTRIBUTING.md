
# Guide de Contribution

## Branches

Nous utilisons une structure de branches comme suit:

- `main` - La branche de production. Tout le code ici doit être stable et prêt pour la production.
- `develop` - Branche de développement principale. Toutes les fonctionnalités terminées sont fusionnées ici.
- `feature-*` - Branches pour les nouvelles fonctionnalités. Créez une branche à partir de `develop`.
- `hotfix-*` - Branches pour les corrections urgentes. Créez une branche à partir de `main`.

## Workflow de développement

1. Créez une branche pour votre nouvelle fonctionnalité:
   ```
   git checkout develop
   git pull
   git checkout -b feature-ma-fonctionnalite
   ```

2. Développez votre fonctionnalité et commitez régulièrement:
   ```
   git add .
   git commit -m "Description claire du changement"
   ```

3. Poussez vos changements vers GitHub:
   ```
   git push -u origin feature-ma-fonctionnalite
   ```

4. Créez une Pull Request vers la branche `develop`.

5. Après examen et approbation, la PR sera fusionnée dans `develop`.

6. Une fois toutes les fonctionnalités nécessaires fusionnées, `develop` sera fusionné dans `main` pour le déploiement.

## Feature Flags

Pour le développement de fonctionnalités susceptibles d'être activées/désactivées en production:

1. Utilisez les feature flags définis dans le fichier `.env`:
   ```
   FEATURE_CHATBOT=true
   FEATURE_ANALYTICS=true
   ```

2. Dans le code, vérifiez l'état du feature flag avant d'activer la fonctionnalité:
   ```javascript
   if (process.env.FEATURE_CHATBOT === 'true') {
     // Code pour le chatbot
   }
   ```

## Tests

- Assurez-vous que tous les tests passent avant de soumettre une PR.
- Écrivez des tests pour toute nouvelle fonctionnalité.

## Déploiement

Le déploiement est automatisé via GitHub Actions:
- Les pushes sur `main` déclenchent un déploiement en production
- Les PR vers `main` exécutent les tests sans déploiement

## Conventions de code

- Utilisez ESLint pour le linting du code
- Suivez les conventions de nommage existantes
- Documentez les nouvelles fonctionnalités et API
