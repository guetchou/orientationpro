# Orientation Pro Congo

Orientation Pro Congo met en relation l'identité d'une personne, son orientation professionnelle, ses documents d'employabilité et les acteurs autorisés à l'accompagner ou la recruter.

## Language

**Compte** :
Identité de connexion associée à une adresse e-mail unique et à un état de cycle de vie.
_Éviter_ : utilisateur Supabase, compte local, auth user

**Profil** :
Données personnelles et professionnelles rattachées à exactement un **Compte**.
_Éviter_ : user data, fiche utilisateur

**Rôle** :
Catégorie canonique attribuée à un **Compte** parmi `user`, `conseiller`, `coach`, `recruteur`, `rh`, `admin` et `super_admin`.
_Éviter_ : `superadmin`, `super-admin`, drapeau admin

**Permission** :
Autorisation atomique accordée à un **Rôle** et contrôlée côté serveur.
_Éviter_ : accès implicite, garde React

**Session** :
Connexion révocable d'un **Compte**, identifiée côté serveur et renouvelée par rotation.
_Éviter_ : token permanent, connexion locale

**Document CV** :
Fichier privé appartenant à un **Compte** et accessible seulement au propriétaire ou à un **Rôle** explicitement autorisé.
_Éviter_ : upload public, resume partagé

**Résultat d'orientation** :
Résultat versionné d'un test passé par un **Compte**, accompagné de sa méthode de calcul.
_Éviter_ : score magique, résultat scientifiquement validé sans preuve

**Rendez-vous** :
Créneau d'accompagnement reliant un **Compte** à un conseiller ou coach autorisé.
_Éviter_ : disponibilité, simple événement calendrier

## Relationships

- Un **Compte** possède exactement un **Profil**.
- Un **Compte** possède un ou plusieurs **Rôles** et zéro ou plusieurs **Sessions**.
- Un **Rôle** regroupe plusieurs **Permissions**.
- Un **Compte** possède zéro ou plusieurs **Documents CV** et **Résultats d'orientation**.
- Un **Rendez-vous** relie exactement un bénéficiaire à exactement un conseiller ou coach.

## Example dialogue

> **Développeur :** « La garde React peut-elle autoriser un conseiller à lire un Document CV ? »
> **Expert métier :** « Non. La garde masque l'écran ; l'interface serveur vérifie la Permission et l'affectation avant de restituer le Document CV. »

## Flagged ambiguities

- « utilisateur » désignait à la fois le **Compte**, le **Profil** et le **Rôle** `user` ; ces concepts sont désormais distincts.
- `superadmin`, `super-admin` et `super_admin` désignaient le même **Rôle** ; seul `super_admin` est canonique.
- « disponibilité » était parfois utilisée comme **Rendez-vous** ; une disponibilité est un créneau proposé, un Rendez-vous est une réservation confirmée ou en cours de traitement.
