
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3c7ee4eb-63ae-4ed8-8d9d-9d1710f7c25f

## Déploiement avec Docker

Pour déployer l'application en local avec Docker, suivez ces étapes :

1. Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine.

2. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Frontend
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase

# Backend
DB_HOST=db
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=app_db
MYSQL_ROOT_PASSWORD=rootpassword
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Feature flags
FEATURE_CHATBOT=true
FEATURE_ANALYTICS=true
```

3. Construisez et démarrez les conteneurs :
```bash
docker-compose up --build
```

4. L'application sera accessible à l'adresse : http://localhost:8080

Pour arrêter l'application :
```bash
docker-compose down
```

## Architecture du projet

Le projet est divisé en deux parties principales :

1. **Frontend** - Application React avec TypeScript, Tailwind CSS et shadcn-ui
   - Exécuté via Nginx dans le conteneur Docker
   - Situé dans le répertoire racine du projet

2. **Backend** - API Node.js/Express avec MySQL
   - Exécuté via PM2 dans le conteneur Docker
   - Situé dans le répertoire `/backend`

## Gestion des fonctionnalités (Feature Flags)

L'application utilise des feature flags pour activer/désactiver certaines fonctionnalités :

- `FEATURE_CHATBOT` - Active/désactive le chatbot AI
- `FEATURE_ANALYTICS` - Active/désactive les analyses de données

Ces flags peuvent être configurés dans le fichier `.env` ou directement dans l'interface d'administration.

## Environnements de développement

- **Développement** - Utilisez `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
- **Test** - Utilisez `docker-compose -f docker-compose.yml -f docker-compose.test.yml up`
- **Production** - Utilisez `docker-compose up -d`

## CI/CD avec GitHub Actions

Le projet est configuré avec GitHub Actions pour l'intégration et le déploiement continus :

- Les tests sont exécutés sur chaque Pull Request
- Le déploiement en production est automatique lors d'un push sur la branche `main`

Voir le fichier `.github/workflows/deploy.yml` pour plus de détails.

## Contribuer au projet

Consultez le fichier `CONTRIBUTING.md` pour les directives de contribution.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3c7ee4eb-63ae-4ed8-8d9d-9d1710f7c25f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js/Express
- MySQL
- Docker & Docker Compose
- PM2
- GitHub Actions

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3c7ee4eb-63ae-4ed8-8d9d-9d1710f7c25f) and click on Share -> Publish.

Pour un déploiement sur un serveur de production, suivez les étapes ci-dessous :

1. Configurez les secrets GitHub pour le déploiement :
   - `DOCKER_HUB_USERNAME` et `DOCKER_HUB_TOKEN` pour Docker Hub
   - `DEPLOY_HOST`, `DEPLOY_USER` et `DEPLOY_KEY` pour l'accès SSH au serveur

2. Poussez sur la branche `main` pour déclencher un déploiement automatique.

3. Ou déployez manuellement en exécutant les commandes suivantes sur votre serveur :
   ```bash
   cd /chemin/vers/application
   git pull
   docker-compose up -d --build
   ```

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
