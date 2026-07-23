# Matrice de migration Supabase vers MySQL

Date : 2026-06-20  
PRD : GitHub Issue #3

## Constat

Le client nommé Supabase est actuellement un mock local. Il retourne des objets incomplets et ne persiste pas les écritures. Les écrans qui l'appellent ne démontrent donc ni stockage, ni authentification, ni temps réel. La suppression immédiate des appels masquerait des fonctionnalités attendues ; chaque groupe doit d'abord recevoir un contrat HTTP, une implémentation MySQL et des tests d'autorisation.

## Matrice fonctionnelle

| Domaine | Tables/fonctions référencées | État observé | Remplacement MySQL/API | Preuve avant retrait |
|---|---|---|---|---|
| Identité | `profiles`, `user_roles`, auth Supabase | mock et fallbacks locaux concurrents | Comptes, profils, rôles, permissions, sessions ; routes inscription/session/profil | tests cycle de compte, rôles et révocation |
| Orientation | `test_results`, `test_sessions`, `ai_analyses` | lectures/écritures non persistées | routes de sessions, réponses, résultats versionnés | calculs unitaires et historique par propriétaire |
| CV | `cv_analyses`, `resumes` | API Express partielle et appels Supabase parallèles | Documents CV privés et analyses rattachées au Compte | tests propriétaire/admin, MIME et rapport |
| Candidats | `candidates` | doublons de hooks et backend partiel | candidats, compétences et candidatures via routes versionnées | matrice recruteur/RH et transactions |
| Emploi | jobs, applications, matching | plusieurs familles de routes Express | offres, favoris, candidatures et historique de statut | contrats HTTP et autorisations organisationnelles |
| Rendez-vous | `availability`, `availabilities`, `appointments` | noms incohérents et temps réel simulé | disponibilités et rendez-vous avec statuts explicites | conflits de créneau et rôles conseiller/coach |
| Contenu | `blog_posts`, `cms_contents` | deux modèles de publication | articles, catégories et médias versionnés | brouillon, validation, publication, archivage |
| Forum | `forum_domains`, `forum_posts` | appels directs depuis le navigateur | routes forum avec modération et pagination | droits auteur/modérateur et tests XSS |
| Paiements | `payments`, `create-payment`, `card-payment`, fonctions dynamiques | Edge Functions non démontrées | intentions, événements, webhooks et réconciliation | signatures fournisseur et idempotence ; aucun faux succès |
| Notifications | notifications et canaux Realtime | abonnement mock sans événement | notifications internes et outbox MySQL | lecture/non-lu, préférence et retry |
| Analytique | `personal_analytics`, `user_activities` | appels directs et données personnelles dispersées | événements minimisés avec rétention | consentement, purge et absence de PII dans logs |
| Gamification | `user_game_profiles`, `user_achievements`, `daily_missions`, `xp_activities` | nombreuses écritures non persistées | module différé derrière contrats métier | règles déterministes et idempotence |
| Profil carrière | `career_dna` | persistance Supabase directe | profil carrière versionné | tests de calcul et historique |
| Administration | profils, médias, identifiants | accès frontend direct | routes administratives avec permissions atomiques | tests de chaque Permission et audit log |

## Flux orphelins ou contradictoires

- `availability` et `availabilities` désignent deux tables différentes pour le même concept apparent.
- `cv_analysis`, `cv_analyses` et `resumes` se chevauchent sans propriété canonique.
- `blog_posts` et `cms_contents` décrivent deux modèles de contenu.
- `superadmin`, `super_admin` et `super-admin` sont utilisés comme variantes de rôle.
- Le frontend combine `VITE_API_URL`, `VITE_BACKEND_URL`, URLs relatives et une adresse privée codée en dur.
- Le backend monte deux familles de routes d'offres et plusieurs contrôleurs de scraping.
- Les réponses de réinitialisation, profil et super-administration annoncent HTTP 200 sans effectuer l'opération.
- Les fonctions de paiement sont présentes mais aucune intégration fournisseur réelle n'est démontrée.

## Ordre de migration

1. Identité, Session, Rôle et Permission.
2. Client HTTP commun et profil.
3. Documents CV et analyses.
4. Tests d'orientation et historique.
5. Offres, candidatures et candidats.
6. Disponibilités, rendez-vous et notifications.
7. Contenu et médias.
8. Paiements par contrats, puis adapters fournisseurs validés.
9. Analytique, gamification et profil carrière.

## Critère global de suppression Supabase

Un fichier ou appel Supabase peut être retiré seulement si son contrat de remplacement existe, que l'implémentation MySQL passe ses tests d'autorisation et de persistance, que le frontend utilise le client commun, et qu'aucune référence active ne reste dans les routes ou workflows concernés.
