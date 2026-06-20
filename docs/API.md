# Interface HTTP

## Identité et Session v1

Préfixe : `/api/v1/auth`
Activation serveur : `AUTH_V1_ENABLED=true`
Format d'erreur : `{ "error": { "code": "...", "message": "..." } }`

| Méthode | Route | Authentification | Résultat principal |
|---|---|---|---|
| POST | `/register` | publique | crée un Compte `user` en attente de vérification |
| POST | `/verify-email` | jeton à usage unique | active le Compte |
| POST | `/login` | publique | access token 15 min et cookie refresh HttpOnly |
| POST | `/refresh` | cookie refresh | rotation du refresh token et nouvel access token |
| GET | `/session` | Bearer access token | Compte courant après validation serveur de la Session |
| POST | `/logout` | cookie refresh | révocation et suppression du cookie |
| POST | `/password-reset/request` | publique | réponse 202 générique |
| POST | `/password-reset/confirm` | jeton à usage unique | nouveau mot de passe et révocation des Sessions |

### Contrat de Session

- JWT HS256, issuer `orientationpro-api`, audience `orientationpro-clients`.
- Durée access token : 15 minutes.
- Refresh token : 32 octets aléatoires, 30 jours, jamais retourné dans le JSON.
- Cookie : `orientationpro_refresh`, `HttpOnly`, `SameSite=Lax`, `Secure` en production, chemin `/api/v1/auth`.
- Le store conserve uniquement SHA-256 du refresh token.
- Une réutilisation après rotation révoque la famille de Session.
- Les Rôles sont exposés dans `roles[]` avec les valeurs canoniques documentées dans `CONTEXT.md`.

### Codes d'erreur principaux

- `INVALID_REGISTRATION`
- `ACCOUNT_EXISTS`
- `INVALID_CREDENTIALS`
- `ACCOUNT_NOT_VERIFIED`
- `INVALID_VERIFICATION_TOKEN`
- `SESSION_REQUIRED`
- `INVALID_SESSION`
- `SESSION_REVOKED`
- `INVALID_PASSWORD_RESET`

## État d'activation

L'interface est raccordée au serveur mais désactivée par défaut. Elle ne doit pas être activée avant configuration MySQL/SMTP, application des migrations, limitation de débit et raccordement du client web. L'ancienne interface `/api/auth` est également désactivée par défaut via `LEGACY_AUTH_ENABLED=false`.
