
# Backend - Application d'Orientation

## Installation et démarrage

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Configuration
Copiez le fichier `.env` et ajustez les paramètres si nécessaire.

### 3. Démarrage du serveur
```bash
npm start
```

Ou en mode développement :
```bash
npm run dev
```

## Endpoints disponibles

- `GET /` - Page d'accueil avec informations de debug
- `GET /api/test/health` - Test de santé du serveur
- `POST /api/auth/login` - Connexion utilisateur/admin
- `POST /api/auth/register` - Inscription utilisateur
- `GET /api/auth/verify-admin` - Vérification admin

## Comptes de test

- **Admin** : `admin@example.com` / `admin123`
- **Utilisateur** : `user@example.com` / `password123`

## Serveur
Le serveur démarre sur le port 3000 par défaut.
URL : http://localhost:3000
