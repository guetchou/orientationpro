
# Guide de Contribution

## Architecture

Ce projet utilise les technologies suivantes:
- **Frontend**: React avec Vite
- **Backend**: NestJS (API REST)
- **CMS**: Directus pour la gestion de contenu
- **Base de données**: MySQL
- **Déploiement**: Docker et GitHub Actions

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

## Structure du Backend NestJS

Le backend NestJS est organisé comme suit:
- `src/`: Code source principal
  - `main.ts`: Point d'entrée de l'application
  - `app.module.ts`: Module principal
  - `auth/`: Module d'authentification
  - `user/`: Module de gestion des utilisateurs
  - `feature-flags/`: Module de gestion des fonctionnalités
  - `health/`: Module de surveillance de l'application

Pour ajouter un nouveau module:
```
cd backend
npm run nest generate module mon-module
npm run nest generate controller mon-module
npm run nest generate service mon-module
```

## Feature Flags

Pour le développement de fonctionnalités susceptibles d'être activées/désactivées en production:

1. Utilisez les feature flags définis dans le fichier `.env`:
   ```
   FEATURE_CHATBOT=true
   FEATURE_ANALYTICS=true
   ```

2. Dans le code NestJS, accédez aux feature flags via ConfigService:
   ```typescript
   constructor(private configService: ConfigService) {}
   
   someMethod() {
     if (this.configService.get('FEATURE_CHATBOT') === 'true') {
       // Code pour le chatbot
     }
   }
   ```

3. Vous pouvez également utiliser l'API REST `/feature-flags` pour récupérer l'état des fonctionnalités.

## Directus CMS

Directus est notre système de gestion de contenu headless:

1. Accédez à l'interface d'administration à `http://localhost:8055`
2. Les schémas et collections sont disponibles dans l'onglet "Schéma"
3. Pour récupérer des données depuis NestJS, utilisez le client HTTP NestJS

## Tests

- Assurez-vous que tous les tests passent avant de soumettre une PR
- Écrivez des tests pour toute nouvelle fonctionnalité
- Les tests peuvent être exécutés avec: `npm test` (frontend) et `cd backend && npm test` (backend)

## Déploiement

Le déploiement est automatisé via GitHub Actions:
- Les pushes sur `main` déclenchent un déploiement en production
- Les PR vers `main` exécutent les tests sans déploiement

## Conventions de code

- Utilisez ESLint pour le linting du code
- Suivez les conventions de nommage existantes
- Documentez les nouvelles fonctionnalités et API
- Utilisez les décorateurs NestJS pour définir clairement les rôles de chaque composant
