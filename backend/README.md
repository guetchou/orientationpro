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

## Matrice d'accès par rôle (API Backend)

| Méthode + Endpoint                | Public | Auth | Admin | Superadmin | Conseiller | Coach | Recruteur | RH | User | Commentaires |
|-----------------------------------|--------|------|-------|------------|------------|-------|-----------|----|------|--------------|
| POST   /api/auth/register         | ✅     |      |       |            |            |       |           |    |      | Inscription  |
| POST   /api/auth/login            | ✅     |      |       |            |            |       |           |    |      | Connexion    |
| POST   /api/auth/reset-password   | ✅     |      |       |            |            |       |           |    |      | Reset pass   |
| POST   /api/auth/update-password  | ✅     |      |       |            |            |       |           |    |      | Update pass  |
| POST   /api/auth/create-super-admin|       | ✅   | ✅    | ✅         |            |       |           |    |      | Création superadmin (admin/superadmin only) |
| GET    /api/auth/verify-admin     |        | ✅   | ✅    | ✅         |            |       |           |    |      | Vérification admin (admin/superadmin only) |
| GET    /api/auth/profile/:id      |        | ✅   | ✅*   | ✅*        |            |       |           |    | ✅*  | *Soit owner, soit admin/superadmin |
| PUT    /api/auth/profile/:id      |        | ✅   | ✅*   | ✅*        |            |       |           |    | ✅*  | *Soit owner, soit admin/superadmin |
| GET    /api/test/health           | ✅     |      |       |            |            |       |           |    |      | Santé        |
| GET    /api/test/db               | ✅     |      |       |            |            |       |           |    |      | Test DB      |
| GET    /api/feature-flags/        | ✅     |      |       |            |            |       |           |    |      | Liste flags  |
| PATCH  /api/feature-flags/:id     |        | ✅   | ✅    | ✅         |            |       |           |    |      | MAJ flag (admin/superadmin only) |

**Légende** :
- ✅ = accès autorisé
- Auth = authentification requise (JWT)
- * = accès si owner OU admin/superadmin

**À adapter selon l'évolution des routes et des rôles.**
