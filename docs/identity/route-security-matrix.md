# Matrice AuthN/AuthZ

État observé sur `main` au commit `5891fc4` le 29 juillet 2026. Cette matrice décrit le montage Express et React ; elle ne prouve pas la configuration effective des feature flags en production.

## Légende

| Niveau | Signification |
|---|---|
| Public | Accessible sans Session par conception |
| AuthN | Session Auth V1 active requise |
| AuthZ | AuthN puis Permission serveur requise |
| Legacy | Ancien middleware JWT, incompatible avec la frontière Auth V1 |
| Non gardé | Aucune garde visible au niveau routeur ; à traiter comme exposition jusqu'à preuve contraire |

## Identité Auth V1

| Méthode et route | Niveau actuel | Décision cible | Écart |
|---|---|---|---|
| `GET /api/v1/auth/oauth/:provider/start` | Public | Public + anti-abus | Rate limit absent |
| `GET /api/v1/auth/oauth/:provider/callback` | Public, state/nonce/PKCE | Public | Rattachement de Compte absent |
| `POST /api/v1/auth/register` | Public | Public + anti-abus | Rate limit et renvoi de vérification absents |
| `POST /api/v1/auth/login` | Public | Public + anti-abus | Rate limit, verrouillage progressif et alerte absents |
| `POST /api/v1/auth/verify-email` | Public, token ponctuel | Public + anti-abus | Renvoi de vérification absent |
| `POST /api/v1/auth/refresh` | Cookie de Session | AuthN | Conforme au principe de rotation |
| `GET /api/v1/auth/session` | Bearer + Session active | AuthN | Conforme |
| `POST /api/v1/auth/logout` | Cookie facultatif | AuthN tolérant | Déconnexion de toutes les Sessions absente |
| `POST /api/v1/auth/password-reset/request` | Public, réponse non énumérable | Public + anti-abus | Frontend non raccordé, rate limit absent |
| `POST /api/v1/auth/password-reset/confirm` | Public, token ponctuel | Public + anti-abus | Page frontend absente, politique de révocation à préciser |

## Modules V1

| Famille | Routes | Niveau actuel | Écart |
|---|---|---|---|
| Profil | `GET/PUT /api/v1/profile`, `PUT /education`, `PUT /skills`, `PATCH /hypotheses/:id`, `GET /skills/search` | AuthN globale, propriété par `req.auth.account.id` | Permissions explicites absentes ; acceptable seulement si tout Compte `user` y a droit |
| Orientation RIASEC | instrument, tentatives, soumission, résultats | AuthZ globale : lecture ou création | Protégé |
| Carrière | catalogue, métiers, détail, matches | AuthZ par route | Protégé |
| CV | création, liste, détail, PDF, suppression | AuthZ par route | Protégé |

## Authentification historique

Cette famille n'est montée que si `LEGACY_AUTH_ENABLED=true`.

| Route | Niveau actuel | Décision cible |
|---|---|---|
| `POST /api/auth/register` | Public legacy | Migrer puis supprimer |
| `POST /api/auth/login` | Public legacy | Migrer puis supprimer |
| `POST /api/auth/reset-password` | Public legacy | Remplacer par Auth V1 |
| `POST /api/auth/update-password` | Public legacy visible au routeur | Bloquer puis remplacer |
| `POST /api/auth/create-super-admin` | Legacy + rôles `admin/superadmin` | Remplacer par invitation `super_admin` |
| `GET /api/auth/verify-admin` | Legacy + rôles non canoniques | Migrer vers Permission |
| `GET/PUT /api/auth/profile/:id` | Legacy, identifiant client | Remplacer par AuthN et propriété serveur |

## Routes historiques montées sans garde visible

Les contrôleurs peuvent contenir des vérifications supplémentaires, mais aucune frontière commune n'est imposée par leurs routeurs. Le lot de migration devra vérifier chaque contrôleur et chaque consommateur avant modification.

| Préfixe | Opérations observées | Risque dominant | Cible |
|---|---|---|---|
| `/api/candidates` | liste, statistiques, détail, création, modification, suppression | Données candidat et administration | AuthZ recruteur/RH |
| `/api/jobs` via `job.routes` | création, liste, détail, modification, suppression, publication, statistiques | Administration d'offres | Lecture publique séparée, écritures AuthZ |
| `/api/jobs` via `jobScraping.routes` | catalogue, recherche, candidature, déclenchement scraping | Collision de routeurs et opération admin | Public lecture, AuthN candidature, AuthZ scraping |
| `/api/ats` | parsing CV, analyse, matching, analytics, notifications, tests | Données personnelles et fonctions coûteuses | AuthZ stricte + quotas |
| `/api/appointments` | création, listes par acteur, statut, créneaux, statistiques | IDOR et données de rendez-vous | AuthN propriété + AuthZ conseiller |
| `/api/messaging` | envoi, conversations, lecture, non-lus, upload | Messages et fichiers privés | AuthN propriété + validation fichier |
| `/api/applications` | candidature, listes, statut, statistiques | IDOR et décisions de recrutement | AuthN propriété + AuthZ recruteur |
| `/api/matching` | candidats par offre, offres par candidat, auto-match | Profilage et données privées | AuthZ selon acteur |
| `/api/communication` | e-mails, statuts, rappels, notifications | Envoi externe et abus | AuthZ + file/outbox + idempotence |
| `/api/cv` legacy | upload, historique, analyse, PDF | Utilise l'ancien middleware | Migrer vers `/api/v1/cv` puis supprimer |
| `/api/test/db` | diagnostic base | Fuite opérationnelle potentielle | Désactiver hors test ou AuthZ opérationnelle |

## Frontend Identité

| Route web | État observé | Cible |
|---|---|---|
| `/register` | Montée, Auth V1 et OAuth présents | Conserver |
| `/verify-email` | Montée, appelle Auth V1 | Conserver + renvoi |
| `/login` | Montée, Auth V1 et OAuth présents | Conserver |
| `/forgot-password` | Montée, appelle `/api/auth/reset-password` | Raccorder à `/api/v1/auth/password-reset/request` |
| `/reset-password` | Composant présent mais route absente ; contrat legacy | Monter et raccorder à `/api/v1/auth/password-reset/confirm` |
| `/account/security` | Absente | Ajouter : identités, Sessions, mot de passe, alertes |

## Critères de fermeture

La dette Identité ne peut être déclarée fermée que lorsque :

- chaque route montée possède un niveau Public, AuthN ou AuthZ explicite et testé ;
- aucune route privée ne dépend exclusivement d'un garde React ;
- le parcours inscription → vérification → connexion → refresh → déconnexion fonctionne en E2E ;
- le parcours oubli → e-mail → nouveau mot de passe → révocation fonctionne en E2E ;
- Google et Meta couvrent création, connexion, rattachement, dissociation et conflits ;
- les Sessions sont listables et révocables ;
- les événements critiques produisent audit et notification sans fuite de secret ;
- Supabase, Auth legacy et les rôles non canoniques ne sont plus utilisés ;
- le pipeline canonique et une recette authentifiée à deux Comptes sont verts.

