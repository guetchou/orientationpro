# Matrice d’autorisation et d’isolation V5-R1

## Principe

Toute donnée propriétaire est résolue depuis `req.auth.account.id`. Un
identifiant de compte fourni dans l’URL, la query ou le body ne peut pas changer
le propriétaire de l’opération. Une ressource d’un autre compte doit être
indiscernable d’une ressource inexistante.

| Surface | Authentification | Portée propriétaire | Preuve existante | État |
|---|---|---|---|---|
| `/api/v1/profile` | Session v1 | `account_id = req.auth.account.id` | tests profil/MySQL | à rejouer |
| `/api/v1/profile/syntheses` | Session v1 | résultat, recommandation et profil filtrés par compte | tests synthèse/MySQL | à rejouer |
| `/api/v1/life-projects` | Session v1 | `owner_account_id` sur lecture/écriture | `life-project-mysql.test.js` crée deux comptes et refuse la lecture croisée | preuve codée |
| `/api/v1/orientation` | Session v1 | tentatives et résultats filtrés par compte | tests RIASEC/MySQL | à rejouer |
| `/api/v1/career` | Session + Permission selon opération | snapshots filtrés par compte | tests carrière/MySQL | à rejouer |
| `/api/v1/cv` | Session + Permission | analyses filtrées par compte | tests CV/MySQL | à rejouer |
| routes legacy hors `/api/v1` | contrôles hétérogènes | non démontrée | inventaire V5-A | désactivées par défaut par #121 |

## Gate

Avant activation d’une surface :

1. créer deux comptes réels dans MySQL jetable ;
2. créer une ressource avec le compte A ;
3. vérifier liste, lecture, modification et suppression avec le compte B ;
4. attendre `404` ou résultat vide, jamais les métadonnées du compte A ;
5. vérifier que la tentative n’a modifié ni version, ni historique, ni enfant ;
6. répéter avec identifiants valides, invalides et appartenant à un autre compte.

La désactivation des routes legacy réduit la surface ; elle ne valide pas leur
autorisation interne. Toute réactivation exige une migration route par route
vers Session v1, Permission explicite et tests MySQL multi-compte.
