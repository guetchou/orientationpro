---
status: accepted
---

# Sessions révocables gérées par le serveur

L'authentification utilise un access token JWT de 15 minutes et un refresh token opaque, rotatif et haché dans MySQL. Le web reçoit le refresh token dans un cookie `HttpOnly`, `Secure`, `SameSite=Lax`; le futur mobile l'enregistrera dans le stockage sécurisé natif. Les tokens persistants dans `localStorage`, les comptes de démonstration et les secrets de fallback sont exclus.

## Consequences

- Une **Session** peut être révoquée sans attendre l'expiration du JWT.
- L'inscription publique crée uniquement un **Compte** `user` en attente de vérification.
- Les comptes privilégiés sont créés par invitation d'un `super_admin`.
- Les flux e-mail refusent de démarrer en production sans adapter configuré.
