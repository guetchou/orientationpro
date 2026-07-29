---
status: accepted
---

# Identité comme frontière unique d'authentification et d'autorisation

## Contexte

MAKOKI possède aujourd'hui trois modèles qui se chevauchent :

- Auth V1 sous `/api/v1/auth`, adossé à MySQL et à des Sessions révocables ;
- des routes historiques sous `/api/*`, dont certaines utilisent un ancien middleware JWT et dont beaucoup n'exposent aucune garde ;
- des écrans frontend encore reliés à l'ancien contrat ou à Supabase.

Cette coexistence rend impossible une garantie simple du type « toute donnée privée est protégée de la même façon ». Elle a déjà produit un parcours de réinitialisation incohérent : l'e-mail Auth V1 pointe vers `/reset-password`, route absente du routeur web, tandis que `/forgot-password` appelle l'ancien endpoint `/api/auth/reset-password`.

## Décision

Le module **Identité** devient l'unique propriétaire de :

- l'inscription, la vérification d'adresse et la connexion ;
- la récupération et le changement de mot de passe ;
- les identités Google et Meta, leur rattachement et leur dissociation ;
- les Sessions, leur rotation, leur révocation et leur inventaire ;
- l'authentification des requêtes ;
- l'évaluation des rôles et Permissions ;
- les événements de sécurité et les notifications associées ;
- les invitations, la suspension et la fermeture d'un Compte.

Son interface HTTP canonique est `/api/v1/auth/*`. Les autres modules ne lisent ni ne valident directement des mots de passe, cookies, JWT ou identités sociales. Ils consomment deux interfaces serveur étroites :

- `authenticate(req)` établit `req.auth.account` et une Session active ;
- `authorize(accountId, permissionId, resource?)` décide une Permission et refuse par défaut.

Le navigateur expose les parcours canoniques suivants :

- `/register`
- `/verify-email`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/account/security`

Les détails de stockage restent derrière le module. Les tests d'intégration MySQL exercent les parcours HTTP publics et vérifient les effets observables, l'isolation entre Comptes et la révocation des Sessions.

## Invariants

1. Une route métier privée doit authentifier la requête côté serveur.
2. Une opération sensible ou privilégiée doit aussi vérifier une Permission canonique côté serveur.
3. Une protection React améliore l'expérience mais ne constitue jamais une autorisation.
4. Un identifiant de Compte fourni par le client ne décide jamais la propriété d'une ressource.
5. L'inscription publique attribue seulement le rôle `user`; `super_admin` reste le seul rôle d'administration globale.
6. Un refresh token reste opaque, rotatif, haché au repos et transporté par cookie `HttpOnly`.
7. Une réinitialisation de mot de passe et un changement d'identité révoquent les Sessions concernées selon une politique explicitement testée.
8. Les réponses de récupération ne permettent pas l'énumération des Comptes.
9. Une identité sociale n'est jamais rattachée sur la seule égalité d'une adresse e-mail non prouvée. Le rattachement exige une Session récente ou une preuve supplémentaire.
10. Tout événement critique est traçable sans journaliser de secret, token ou mot de passe.

## Stratégie de migration

La migration se fait par tranches verticales et réversibles :

1. caractériser les contrats existants et publier la matrice de sécurité ;
2. réparer les parcours e-mail et unifier le client web sur Auth V1 ;
3. livrer le rattachement Google/Meta et la page de sécurité ;
4. migrer chaque famille de routes historiques derrière `authenticate` et `authorize` ;
5. supprimer Supabase et l'ancien middleware seulement après preuve qu'aucun consommateur ne les utilise ;
6. ajouter protections anti-abus, journal d'audit, alertes, inventaire de Sessions et cycle de vie du Compte ;
7. évaluer MFA et passkeys dans une décision séparée.

Chaque tranche ajoute ses tests avant de changer le comportement, passe le pipeline canonique, puis est déployée par ce pipeline. Aucun mélange de branches ni correctif manuel sur le VPS.

## Conséquences

- Le module Identité offre une interface plus petite que son implémentation.
- Les modules Profil, Orientation, Carrière et CV conservent leurs frontières et ne sont pas réécrits.
- Certaines routes historiques devront être temporairement désactivées ou migrées avant d'être considérées comme sûres.
- Les interfaces publiques ont été confirmées avant l'ajout des tests de caractérisation.

