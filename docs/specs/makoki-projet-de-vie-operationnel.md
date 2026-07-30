# Programme P0 — Projet de vie opérationnel

Statut : source de vérité produit et métier  
Issue de pilotage : #169  
Priorité : P0 absolue  
Date de vérification externe : 2026-07-30

## Objectif immédiat unique

Rendre le moteur Projet de vie utilisable par un conseiller avec un jeune réel, dès la première séance, jusqu’à la remise d’un résultat concret.

Le moteur n’est pas déclaré opérationnel parce que ses API répondent. Il l’est lorsqu’un conseiller peut produire en une séance :

- plusieurs options crédibles et diversifiées ;
- les raisons de chaque option ;
- leurs conditions d’accès ;
- leurs incompatibilités et risques ;
- les informations restant à vérifier ;
- une première action concrète ;
- une synthèse remise au jeune.

Toute dépense produit doit servir ce résultat. L’UX/UI périphérique est gelée sauf blocage du parcours, les nouveaux audits et fonctions secondaires sont suspendus et l’IA générative n’est pas prioritaire.

## Résultat métier attendu

Chaque scénario doit expliquer pourquoi il apparaît, ses forces, conditions, risques, facteurs bloquants, informations manquantes, opportunités locales, sources, niveau de confiance et premières actions sous sept jours. Une option écartée ne disparaît jamais silencieusement : le système doit exposer la condition non satisfaite.

## Diagnostic conseiller

Le diagnostic progressif couvre au minimum :

1. identité de parcours : âge ou tranche d’âge, pays, zone, situation, dernier niveau, diplôme, matières, résultats et interruptions ;
2. objectif immédiat : études, formation, emploi, reprise, réorientation, entrepreneuriat, combinaison emploi-formation ou clarification ;
3. contraintes : mobilité, budget, revenu rapide, durée, équipement, responsabilités, calendrier, disponibilité, handicap volontairement déclaré et documents ;
4. intérêts et préférences : activités, matières, environnement, travail manuel/intellectuel/relationnel/technique, autonomie, collectif, stabilité, public, création, analyse, organisation et pratique ;
5. compétences et expériences : compétences déclarées, stages, bénévolat, emplois, projets, responsabilités, langues, numérique et preuves ;
6. critères de décision classés : durée, coût, proximité, employabilité, intérêt, prestige, alternance, revenus, stabilité, évolution et compatibilité familiale.

Le conseiller remplit et corrige ces informations progressivement pendant l’entretien. Les données déclarées et vérifiées restent distinguées.

## Référentiels

### ESCO

Importer localement les professions, appellations alternatives, compétences essentielles et optionnelles, relations profession-compétence, hiérarchie ISCO, traductions françaises, identifiants, version et provenance. Le dépôt possède déjà l’import ESCO 1.2.1 ; il doit être raccordé au moteur Projet de vie au lieu de rester isolé dans le catalogue métier.

### O*NET

Utiliser O*NET pour enrichir les tâches, connaissances, compétences, aptitudes, intérêts, préparation et technologies. Ces informations décrivent le marché américain : elles servent de référence métier, jamais de preuve locale de salaire, recrutement ou disponibilité.

### Couche locale Makoki

Chaque option locale contient au minimum : intitulé, type, pays et zones, organismes, niveau d’entrée, admission, durée, coût ou fourchette, modalité, calendrier, documents, débouchés plausibles, source, date de vérification, fiabilité et statut `verified`, `to_confirm` ou `obsolete`.

Aucune donnée synthétique de test ne peut être affichée comme opportunité réelle.

## Moteur déterministe v1

### Filtrage bloquant

Écarter ou dégrader explicitement les options incompatibles : niveau inaccessible, calendrier fermé, localisation impossible, coût incompatible sans financement, durée excessive, obligation réglementaire non satisfaite, indisponibilité locale ou contrainte personnelle forte.

### Score multidimensionnel

Base de score : intérêts 20, compétences 15, préférences 10, compatibilité scolaire 15, contraintes pratiques 15, accessibilité locale 10, faisabilité temporelle 5, financière 5 et expérimentation 5. Les pondérations sont transparentes et adaptables selon l’objectif et les critères classés par le jeune.

### Pénalités

- information critique inconnue : -5 à -20 ;
- source locale ancienne : -5 ;
- condition d’accès non vérifiée : -10 ;
- conflit fort : -20 ou exclusion ;
- aucune expérimentation : -5.

### Diversification et confiance

Produire trois à cinq scénarios : prioritaire, proche mais différent, alternatif, éventuellement repli et exploratoire. Si le référentiel ne permet pas trois scénarios valides, le moteur retourne `insufficient_options` et n’invente rien.

La confiance dépend de la complétude du profil, de la fraîcheur et de la vérification des sources, jamais du score seul.

## Contrat de sortie obligatoire

Chaque scénario comprend :

- `id`, `optionId`, `title`, `category`, `positioning`, `rank` ;
- `fitScore`, `confidence`, `reasons`, `strengths` ;
- `conditions`, `risks`, `blockingFactors`, `missingInformation` ;
- `localOpportunities`, `sourceReferences`, `firstActions`, `alternatives` ;
- `scoreBreakdown`, `penalties`, `generatedAt`, `engineVersion`.

Une sortie incomplète ne peut pas être présentée comme recommandation complète.

## Interface conseiller prioritaire

Quatre écrans seulement : diagnostic progressif, options détaillées, comparaison en colonnes, puis synthèse éditable remise au jeune. Le conseiller conserve le dernier mot et peut modifier le résultat avant partage.

## Tests métier obligatoires

La banque initiale couvre dix dossiers anonymisés : lycéen indécis, résultats faibles avec motivation, interruption d’études, diplômé sans emploi, mobilité nulle, besoin de revenu rapide, entrepreneuriat, réorientation, compétences informelles et profil très incomplet.

Chaque dossier vérifie les options plausibles, exclusions, questions indispensables, risques, premières actions, qualité des explications, détection des inconnues et capacité de correction humaine.

## Définition de 100 % opérationnel

Le cycle complet doit passer : diagnostic, import ESCO, référentiel local minimal, trois à cinq options, filtres, explications, sources et dates, confiance et limites, comparaison, correction conseiller, plan d’action, synthèse partageable, persistance, isolation des comptes, validation métier et utilisation en séance réelle.

Le critère ultime est qu’un conseiller accompagne un jeune de la première question à la synthèse sans tableur, document externe ni seconde application.

## Ordre d’exécution

- M1 : diagnostic et données ;
- M2 : recommandation ;
- M3 : interface conseiller ;
- M4 : validation terrain.

Ces lots forment un seul programme et ne doivent pas être interrompus par des chantiers périphériques.

## Sources externes vérifiées

- OIT, *Handbook for Career Development*, 12 juillet 2024 : cadre adaptable aux pays à revenu faible ou intermédiaire, destiné notamment aux enseignants, services publics de l’emploi et praticiens, avec une valeur particulière pour les programmes jeunesse.  
  https://www.ilo.org/resource/other/handbook-career-development
- Commission européenne, ESCO Local API : ESCO v1.2.1, dernière mise à jour le 10 décembre 2025 ; l’installation locale vise performance et indépendance du service distant.  
  https://esco.ec.europa.eu/en/use-esco/use-esco-services-api/esco-local-api
- Commission européenne, téléchargement ESCO : classification gratuite, multilingue et disponible notamment en CSV.  
  https://esco.ec.europa.eu/en/use-esco/download
- U.S. Department of Labor / National Center for O*NET Development : accès à plus de 900 professions et à leurs tâches, connaissances, compétences, aptitudes et technologies.  
  https://services.onetcenter.org/about
