# Sécurité — Orientation Pro Congo

Dernière mise à jour : 2026-06-19
Branche : `refactor/platform-web-mobile-foundation`

## (1) Executive summary

Le lot sécurise les quatre routes CV avec authentification JWT serveur et contrôle de propriété MySQL. Les uploads sont limités à un fichier PDF/DOCX de 5 Mo, renommés avec un UUID et contrôlés par extension, MIME et signature binaire.

Les 10 tests backend ciblés passent. Le build web, TypeScript, la syntaxe backend et ESLint ciblé terminent avec code 0. La validation ne couvre pas encore un scénario connecté à une base MySQL réelle ni un scanner antimalware.

## (2) Inventory avant modification

- `GET /api/cv/history` était anonyme et pouvait retourner tous les CV sans filtre.
- `GET /api/cv/analysis/:id` était anonyme et exposait un enregistrement par identifiant.
- `POST /api/cv/upload` acceptait un `user_id` contrôlé par le client, sans limite ni filtre de type.
- Le PDF implémentait une vérification JWT différente des autres routes.
- `/cv-history` était une route React publique.
- 63 fichiers de `backend/uploads` restent suivis par Git ; leur retrait n'appartient pas à ce lot.

## (3) Actions appliquées

| Priorité | Action | Type | Risque | Validation requise | Exécution |
|---:|---|---|---|---|---|
| 1 | Middleware JWT avant chaque route CV | non destructive | faible | non | appliquée |
| 1 | Ownership SQL par `user_id` issu du JWT | non destructive | faible | non | appliquée |
| 1 | Filtres transversaux réservés à `admin`/`super_admin` | non destructive | moyen | revue métier avant production | appliquée |
| 1 | Limite 5 Mo, PDF/DOCX, UUID, MIME/extension/signature | non destructive | faible | non | appliquée |
| 2 | Historique limité à 50, maximum 100, sans `file_path` ni texte extrait | non destructive | faible | non | appliquée |
| 2 | Protection React et gestion d'erreur de session | non destructive | faible | non | appliquée |
| 2 | Tests backend Node natifs et script `npm test` | non destructive | faible | non | appliquée |

## (4) Backup paths

- `/opt/backups/orientationpro_cv_security_20260619_202656`
- Six fichiers initiaux sauvegardés avec permissions et checksums SHA-256.
- Sauvegarde Git initiale complémentaire : `/opt/backups/orientationpro_initial_20260619_202259.bundle`.
- Restauration fichier par fichier : `cp -p /opt/backups/orientationpro_cv_security_20260619_202656/<chemin> /opt/orientationpro/<chemin>`.

## (5) Tests et vérifications

- `cd backend && npm test` : 10 tests sur 10 réussis.
- Scénarios prouvés : anonyme refusé avant DB ; identité invalide refusée ; paramètres `user_id` ignorés pour un utilisateur ; SQL historique et analyse scindés par propriétaire ; privilèges admin validés ; extension/MIME/signature vérifiés.
- `node --check` sur les fichiers backend modifiés : code 0.
- ESLint ciblé sur tous les fichiers modifiés : code 0.
- `npx tsc --noEmit` : code 0.
- `npm run build` : code 0, 3 923 modules transformés, PWA générée.
- `npx vitest run` : code 1, `jsdom` absent ; aucun test frontend exécuté.
- Aucun nouveau fichier dans `backend/uploads` ; lockfiles inchangés.

Tests impossibles dans ce lot : base MySQL Orientation Pro non démarrée, aucun jeu de données isolé, aucun antivirus/CDR, aucun navigateur E2E. Risque résiduel estimé du flux CV : 35 %, principalement intégration DB, stockage privé et auth mockée.

## (6) Rollback

Avant commit : restaurer les six fichiers existants depuis la sauvegarde, puis retirer uniquement les trois nouveaux chemins après vérification : `backend/src/security/cv-access.js`, `backend/test/cv-security.test.js`, `docs/SECURITY.md`.

Après commit : `git revert <hash-du-commit-sécurité>`. Ne pas utiliser `git reset --hard`.

Le rollback réintroduit les accès CV anonymes ; il ne doit pas être déployé sans mesure compensatoire.

## (7) Diff appliqué

- `backend/src/security/cv-access.js` : politique d'accès et validation de fichier.
- `backend/src/middleware/auth.middleware.js` : secret JWT obligatoire, aucun fallback.
- `backend/src/routes/cv.routes.js` : middleware, limites et validation upload.
- `backend/src/controllers/cv.controller.js` : ownership SQL et réponses minimisées.
- `backend/test/cv-security.test.js` : 10 tests ciblés.
- `backend/package.json` : script de test exécutable.
- `src/router/AppRouter.tsx` : `/cv-history` sous `UserRoute`.
- `src/pages/CVHistory.tsx` : historique minimal et erreurs explicites.

## Risques restant à traiter

1. Authentification encore basée sur des utilisateurs mockés dans `auth.controller.js`.
2. CV nominatifs et `.env` toujours présents dans l'historique Git.
3. Stockage local sans chiffrement, URL temporaire, antivirus ou politique de conservation.
4. CORS global permissif et logs applicatifs trop verbeux.
5. Tests frontend bloqués et aucun E2E API + MySQL.
6. Les privilèges administratifs doivent être confirmés dans une matrice RBAC métier avant production.
