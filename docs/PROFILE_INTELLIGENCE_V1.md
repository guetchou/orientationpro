# Profil intelligent MAKOKI — cadrage V1

## Problème

La page `/profile` actuelle collecte quelques champs administratifs et utilise directement Supabase, alors que l'authentification canonique du produit repose désormais sur Auth V1 et le backend MySQL. Ajouter des champs sans consolider cette architecture créerait un troisième modèle de données concurrent.

## Décision d'architecture

Le profil intelligent devient une ressource Auth V1 détenue par le compte connecté. Supabase ne doit plus être la source de vérité de `/profile`.

Le système sépare explicitement :

- les données déclarées par l'utilisateur ;
- les données structurées et normalisées ;
- les hypothèses proposées par le moteur ;
- les hypothèses confirmées ou rejetées ;
- les preuves associées à une compétence ou une expérience.

Une inférence ne devient jamais un fait sans confirmation de l'utilisateur.

## Périmètre V1

### Situation actuelle

Valeurs structurées :

- élève ;
- étudiant ;
- salarié ;
- indépendant ou entrepreneur ;
- sans emploi ;
- en reconversion ;
- autre.

La situation choisie contrôle les questions suivantes.

### Parcours académique

- niveau d'études normalisé ;
- statut du diplôme : en cours, obtenu, interrompu ;
- intitulé du diplôme ;
- filière ou spécialité ;
- établissement ;
- année d'obtention ou année actuelle.

### Expérience

- activité actuelle ;
- secteur ;
- ancienneté ;
- expériences et projets significatifs.

### Objectif

- choisir une formation ;
- choisir un métier ;
- trouver un emploi ou un stage ;
- se reconvertir ;
- entreprendre ;
- améliorer son employabilité.

### Contraintes

- localisation ;
- mobilité ;
- disponibilité ;
- budget de formation ;
- accès à un ordinateur et à Internet ;
- délai avant besoin de revenu.

### Compétences et intérêts

Les métiers et compétences doivent être autocomplétés à partir des référentiels existants, notamment ESCO lorsque la donnée française est disponible. Les suggestions doivent conserver leur source et leur statut de confiance.

## Modèle de données proposé

### `account_profiles`

Une ligne par compte : identité professionnelle courante, situation, objectif principal, localisation, résumé, complétude et dates.

### `account_education_history`

Historique académique structuré, plusieurs lignes par compte.

### `account_experiences`

Emplois, stages, bénévolat, entrepreneuriat et projets.

### `account_profile_skills`

Compétences déclarées ou confirmées, reliées si possible à une URI ESCO, avec niveau, source et preuve.

### `account_profile_hypotheses`

Propositions du moteur : type, valeur JSON, justification, confiance, statut `proposed`, `confirmed` ou `rejected`.

### `account_profile_constraints`

Contraintes opérationnelles nécessaires aux recommandations réalistes.

## API V1

Routes envisagées :

- `GET /api/v1/profile` ;
- `PUT /api/v1/profile` ;
- `GET /api/v1/profile/options` ;
- `POST /api/v1/profile/education` ;
- `PUT /api/v1/profile/education/:id` ;
- `DELETE /api/v1/profile/education/:id` ;
- `POST /api/v1/profile/experiences` ;
- `POST /api/v1/profile/hypotheses/:id/confirm` ;
- `POST /api/v1/profile/hypotheses/:id/reject`.

Toutes les requêtes sont filtrées par l'identifiant du compte authentifié. Une ressource appartenant à un autre compte doit rester non énumérable.

## Interface V1

La page n'est plus un formulaire unique. Elle devient un parcours progressif :

1. situation actuelle ;
2. parcours académique ;
3. expériences ;
4. compétences et intérêts ;
5. objectif ;
6. contraintes ;
7. synthèse à confirmer.

Chaque étape affiche :

- pourquoi l'information est demandée ;
- les suggestions disponibles ;
- la possibilité de corriger ou ignorer ;
- le taux de complétude ;
- les informations prioritaires encore manquantes.

## Moteur adaptatif V1

Le moteur V1 reste déterministe : règles conditionnelles explicites, sans génération libre obligatoire.

Exemples :

- étudiant → demander niveau, diplôme, filière, établissement et année ;
- salarié → demander métier, secteur, ancienneté et satisfaction ;
- reconversion → demander métier actuel, métier envisagé, délai et contraintes ;
- objectif formation → demander budget, disponibilité et mobilité ;
- compétence sans preuve → proposer d'ajouter un projet, une expérience ou une certification.

Une couche générative pourra ensuite reformuler ou résumer, mais ne devra pas créer de faits.

## Critères de validation

- aucune dépendance Supabase dans le nouveau parcours profil ;
- persistance MySQL Auth V1 ;
- isolation stricte entre comptes ;
- valeurs de niveau d'études structurées et non saisies uniquement en texte libre ;
- questions réellement conditionnelles ;
- suggestions ESCO identifiables et traçables ;
- distinction déclarations, inférences et confirmations ;
- absence de données fictives ;
- tests backend, frontend et parcours authentifié ;
- affichage mobile sans débordement.

## Ordre d'implémentation

1. migration et store MySQL ;
2. API Auth V1 et tests d'isolation ;
3. client TypeScript ;
4. moteur de questions conditionnelles ;
5. interface progressive ;
6. autocomplétion métiers et compétences ;
7. synthèse et complétude ;
8. E2E authentifié ;
9. activation et déploiement contrôlés.
