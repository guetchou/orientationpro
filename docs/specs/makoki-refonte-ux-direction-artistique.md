# Cahier d’exécution — Refonte artistique, UX et produit de Makoki

> **Statut : source de vérité obligatoire.** Toute intervention liée à cette refonte doit lire ce document intégralement avant modification. Aucune exigence ne doit être retirée, réduite, simplifiée, neutralisée ou omise.

## Mission de l’agent

Intervenir comme lead product designer, UX engineer et développeur senior full-stack sur Makoki / OrientationPro. Inspecter le produit existant, préserver les fonctionnalités correctes, éviter les régressions, respecter l’architecture réelle et exécuter le travail de bout en bout.

## Environnement et ordre obligatoire

Le projet principal se trouve dans `/opt/orientationpro` sur le VPS. GitHub CLI est authentifié dans cet environnement.

Avant toute modification :

```bash
git status
git branch --show-current
git remote -v
git log --oneline --decorate -n 15
gh pr status
gh pr list --state open
gh pr list --state merged --limit 10
```

Lire les PR ouvertes, branches actives, changements non fusionnés, revues, conflits, workflows CI et travaux récents. Comprendre `main`, les composants, parcours, design system, routage, authentification, gestion d’état, appels API, persistance, tests, CI et déploiement. Ne pas dupliquer aveuglément une PR existante.

Séquence de travail :

```text
cadrage → inspection → analyse de l’existant → lecture des PR → identification des écarts → branche → implémentation → tests → corrections → commit → push → PR → CI → revue finale → fusion si autorisée et sûre → rapport consolidé
```

Pas de micro-validation. Les questions ne sont permises qu’en cas de blocage réel impossible à résoudre par inspection, code, PR, documentation, configuration, tests ou observation de l’application.

## Règles non négociables

Ne pas retirer une fonctionnalité sans justification, remplacer une fonction réelle par une maquette, masquer un défaut, supprimer du contenu utile sans preuve, créer de faux témoignages ou faux utilisateurs, présenter comme disponible une capacité inexistante, limiter la refonte au cosmétique, casser les parcours, déplacer arbitrairement les repères, introduire une bibliothèque sans nécessité, ou déclarer un résultat validé uniquement parce que le code compile ou que la CI est verte.

Le rapport final doit distinguer : existant, modifié, créé, exécuté, testé, effectivement validé et restant à vérifier.

---

# Direction artistique de Makoki

## Idée directrice

Makoki est une boussole humaine, vivante et encourageante.

Le site doit donner l’impression d’un accompagnement chaleureux, pas d’un logiciel administratif ni d’un tableau de bord technique.

La personnalité visuelle recherchée :

- humaine et proche ;
- optimiste sans être naïve ;
- énergique sans être enfantine ;
- contemporaine sans ressembler à une fintech ;
- professionnelle sans devenir institutionnelle ;
- africaine dans ses visages et ses situations, sans folklore ni clichés.

## 1. Remettre les personnes au centre

Les pages publiques doivent montrer des personnes dans des situations réelles :

- un jeune qui réfléchit à son orientation ;
- une étudiante qui échange avec un proche ;
- un professionnel en transition ;
- une personne qui prépare une candidature ;
- un groupe qui travaille, discute ou apprend ;
- des portraits individuels regardant ou non l’objectif.

La photographie doit paraître naturelle, inclusive et narrative : vraies situations, gestes crédibles, diversité des âges et profils, peu de poses artificielles, aucun filtre lourd et aucune esthétisation publicitaire excessive.

Répartition suggérée :

- Hero : une grande photographie forte, une scène humaine identifiable, une promesse compréhensible et un CTA clair.
- Sections principales : alternance photo–texte et compositions variées.
- Métiers : contextes professionnels et personnes en activité, pas seulement des icônes.
- Profil et résultats : portrait ou illustration humaine discrète, accomplissements et progression visibles.
- Emploi : personnes en activité, en entretien ou en préparation.
- À propos : équipe, vision, scènes de travail et méthodologie expliquée sans jargon dominant.

Éviter les banques d’images où tout le monde sourit artificiellement devant un ordinateur en pointant un écran vide. La présence africaine doit apparaître dans les visages et situations sans folklore ni clichés.

## 2. Les avatars doivent avoir une fonction

Les avatars peuvent servir à :

- incarner les profils utilisateurs ;
- identifier un conseiller réel ;
- humaniser les témoignages ;
- représenter les différents moments d’un parcours ;
- donner une présence au tableau de bord ;
- faciliter la reconnaissance et la continuité de l’accompagnement.

Ne créer aucun faux témoignage accompagné d’un faux portrait. Tant que les témoignages vérifiés ne sont pas disponibles, utiliser :

- des portraits éditoriaux sans citation attribuée ;
- des scénarios clairement présentés comme exemples ;
- des illustrations de personnages cohérentes avec la marque ;
- des cas fictifs explicitement identifiés comme exemples ou simulations.

## 3. Réintroduire du mouvement

Le site doit respirer et réagir.

Animations recommandées :

- apparition douce des sections au défilement ;
- léger déplacement ou zoom des photos ;
- transitions entre les étapes du parcours ;
- progression animée lors de la complétion du profil ;
- cartes qui réagissent au survol ;
- bouton qui confirme visuellement une action ;
- changement fluide entre deux états ;
- petites animations illustrant « explorer », « choisir » ou « avancer » ;
- indicateurs de chargement contextualisés ;
- transitions de sauvegarde et retour visuel après validation.

Le mouvement doit soutenir la compréhension, la progression, le feedback, la hiérarchie et la continuité. Il ne doit pas distraire ou ralentir.

Interdits : carrousel automatique agressif, vidéo sonore automatique, texte défilant, parallaxe excessive, animation gratuite, transition trop longue ou effet bloquant le contenu. Respecter `prefers-reduced-motion`.

## 4. Sortir du tout-cartes blanches

Éviter la succession répétitive : titre, texte, trois cartes blanches, espace vide, nouveau titre, trois cartes blanches.

Varier le rythme avec :

- grande photographie pleine largeur ;
- section éditoriale asymétrique ;
- citation ou phrase forte ;
- chiffres ou étapes en grand format ;
- mosaïque de portraits ;
- bande colorée ;
- illustration ;
- frise de parcours ;
- vue partielle du produit ;
- bloc sombre ou coloré ;
- compositions photo–texte ;
- formes organiques et sections immersives.

Le blanc reste utile mais ne doit pas devenir toute l’identité.

## 5. Donner un univers visuel propre à Makoki

### Palette

Conserver le vert comme couleur de confiance et d’évolution, mais l’enrichir avec :

- verts profonds ;
- verts lumineux ;
- ambre ou jaune chaleureux ;
- tons terre, sable et argile ;
- accents bleu ciel ou corail.

Le site ne doit pas être uniquement vert foncé, blanc et gris. La palette doit être accessible, cohérente, contrastée et exploitable dans tous les états interactifs.

### Formes

Utiliser un vocabulaire inspiré de la boussole et du chemin :

- arcs ;
- trajectoires ;
- points reliés ;
- cercles incomplets ;
- repères ;
- lignes de progression ;
- formes organiques légèrement irrégulières ;
- jalons, orientations, bifurcations et marqueurs d’étapes.

Ces éléments deviennent une signature dans les fonds, transitions, séparateurs, illustrations, graphiques de progression, parcours et états vides.

### Typographie

Produire :

- des titres expressifs et chaleureux ;
- un corps de texte extrêmement lisible ;
- des chiffres et étapes suffisamment grands ;
- une hiérarchie claire ;
- moins de petites capitales et micro-libellés techniques ;
- des boutons compréhensibles et orientés action.

## 6. Donner une histoire à la home

La home ne doit pas être une liste de fonctionnalités. Elle raconte un mouvement en six moments.

### Moment 1 — Je me reconnais

Photographie forte et phrase exprimant le doute, la recherche, l’hésitation ou l’envie d’avancer. Promesse compréhensible et CTA principal.

### Moment 2 — Je comprends que Makoki peut m’aider

Trois situations humaines distinctes avec des visuels différents : orientation, découverte de soi, reconversion, recherche d’emploi, candidature, choix d’un métier ou progression professionnelle. Ne pas présenter cela comme une liste technique de modules.

### Moment 3 — Je découvre le parcours

Frise vivante et illustrée avec personnes, étapes, décisions, progrès, prochaine action et résultats attendus. Ne pas ressembler à une documentation de workflow interne.

### Moment 4 — Je vois ce que je peux obtenir

Aperçus du profil, des pistes métiers, recommandations, résultats et progression, intégrés dans des scènes réelles. Ne pas transformer la section en démonstration technique ou catalogue de captures.

### Moment 5 — Je me projette

Portraits, métiers, histoires courtes, scénarios explicitement présentés comme exemples et témoignages réels seulement lorsqu’ils sont disponibles et vérifiés.

### Moment 6 — J’agis

CTA fort, formulation orientée bénéfice et image positive. Ne pas terminer par un simple bloc coloré.

## 7. Humaniser aussi l’espace connecté

Le tableau de bord doit accueillir :

- salutation personnalisée ;
- avatar utile ;
- vue visuelle de l’avancée ;
- prochaine étape clairement mise en scène ;
- illustrations contextuelles ;
- réussites et étapes terminées ;
- messages encourageants ;
- évolution visible dans le temps ;
- résumé des accomplissements ;
- historique ;
- recommandations contextualisées ;
- actions prioritaires et raccourcis utiles.

Une interface de parcours doit donner le sentiment que quelque chose progresse, pas seulement afficher des données.

## 8. Ce qu’il faut éviter

- minimalisme utilisé comme identité complète ;
- pages uniquement composées de texte et de cartes ;
- icônes génériques à la place de personnes ;
- portraits artificiels ou trop publicitaires ;
- photos occidentales génériques sans rapport avec le public ;
- filtres verts appliqués à toutes les images ;
- animations gratuites ;
- faux témoignages ;
- écrans du produit montrés partout ;
- esthétique d’administration publique, banque, assurance ou fintech ;
- tableaux de bord froids ;
- petites étiquettes techniques ;
- longues listes de fonctionnalités sans narration.

## Brief directeur

Makoki doit montrer des personnes en mouvement, dans des moments de réflexion, de découverte, d’apprentissage et de décision. La photographie apporte l’émotion, les formes indiquent le chemin, l’animation montre la progression et l’interface donne confiance.

Hiérarchie obligatoire :

1. Humain avant interface.
2. Émotion avant explication.
3. Histoire avant fonctionnalités.
4. Photographie avant icônes génériques.
5. Mouvement utile avant immobilité.
6. Clarté et accessibilité sans austérité.

La direction artistique ne doit plus être traitée comme une simple couche de conformité : elle redevient une composante centrale de l’expérience Makoki.

---

# Dix causes UX de churn à analyser et corriger

## 1. Le produit ne montre pas ce que l’utilisateur a accompli

Mettre en évidence historique, résumé, sentiment de progression, étapes terminées, valeur accumulée, activités récentes, résultats enregistrés et prochaines étapes selon les données réellement disponibles. Ne créer aucune donnée fictive. Si le modèle de données ne permet pas l’historique, identifier et implémenter ce qui manque lorsque cela entre dans le périmètre.

## 2. L’interface change sans prévenir

Préserver les repères familiers utiles. Tout déplacement important doit être justifié, assurer une continuité et, si nécessaire, être accompagné d’une indication contextuelle non intrusive.

## 3. Le produit punit les erreurs au lieu de les corriger

Les formulaires ne doivent pas perdre les saisies valides. Corriger les validations uniquement finales, messages génériques, réinitialisations après erreur, erreurs sans résolution et actions destructrices sans protection. Placer les erreurs près de leur cause.

## 4. Résultats trop lents sans feedback visuel

Pour toute latence perceptible : état de chargement, bouton temporairement désactivé avec explication, progression, skeleton si pertinent, message de traitement, confirmation de réussite, échec récupérable, prévention du double clic et des soumissions multiples.

## 5. Labels trop techniques

Le public ne doit pas être exposé inutilement à RIASEC, ESCO, taxonomie, référentiel, scoring, mapping, pipeline ou moteur de recommandation. La communication principale parle des besoins, actions et bénéfices. Les détails méthodologiques vont dans les pages adaptées comme À propos ou Méthodologie.

## 6. Aucun raccourci pour les utilisateurs avancés

Analyser les tâches répétitives et ajouter, lorsque justifié, accès direct, raccourcis, navigation rapide, reprise d’activité, édition directe, recherche, filtres et accès aux éléments récents, sans complexifier l’expérience débutante.

## 7. Le produit ne sauvegarde pas automatiquement

Inspecter les parcours longs et implémenter lorsque pertinent : sauvegarde automatique, brouillon, persistance locale temporaire, reprise après interruption, indication de l’état de sauvegarde et prévention de la perte de données. États explicites : modifications en cours, sauvegarde, enregistré, erreur, réessayer. Valider la persistance réelle après rechargement, reconnexion ou changement d’appareil selon le comportement attendu.

## 8. Les modales interrompent au mauvais moment

Supprimer ou déplacer les interruptions inutiles au milieu d’un formulaire, test, candidature ou parcours critique. Réserver les modales aux décisions immédiates ou confirmations réellement nécessaires.

## 9. Le produit n’explique pas pourquoi une action est impossible

Aucun bouton grisé sans explication. Indiquer pourquoi l’action est indisponible, ce qui manque, comment la débloquer et, si possible, fournir un lien direct vers l’étape nécessaire.

## 10. Le design n’est pas cohérent

Uniformiser comportements et composants : boutons, liens, retour, annulation, validation, erreurs, suppression, chargement, sauvegarde, menus, formulaires, modales, notifications, états vides et progressions. Consolider les primitives communes au lieu de reproduire des variantes incompatibles.

---

# RTK et architecture

Déterminer d’abord si RTK signifie Redux Toolkit, RTK Query ou une autre abstraction du dépôt. Ne pas supposer silencieusement.

Si Redux Toolkit existe déjà : respecter le store, éviter les slices redondants, réserver l’état global aux données partagées, conserver l’état local lorsqu’il est local, utiliser RTK Query seulement si cohérent avec l’architecture, vérifier invalidation du cache, états loading/success/empty/error, appels dupliqués et compatibilité SSR.

Si RTK n’est pas installé, ne pas l’introduire seulement pour satisfaire nominalement la consigne. Évaluer bénéfice, coût de migration, compatibilité et problème réel résolu, puis documenter la décision.

# Contenus et communication

La communication s’adresse au public cible, pas aux développeurs. Éviter sur les pages principales les démonstrations de code, détails d’architecture, noms de bases de données ou modèles internes et formulations techniques.

Vérifier le statut réel de chaque capacité : disponible, partiellement disponible, en développement, prévue ou non implémentée. Ne jamais présenter une vision future comme déjà opérationnelle. Utiliser si nécessaire : Disponible, En préparation, Bientôt disponible, Version pilote ou Fonctionnalité en cours de déploiement.

# Accessibilité et robustesse

Couvrir navigation clavier, focus visible, textes alternatifs, labels, erreurs accessibles, contraste, structure sémantique, titres hiérarchisés, réduction des animations, responsive mobile/tablette/desktop, optimisation des images, stabilité, performance perçue, réseau lent, états vides, erreurs et chargements. Ne pas transformer l’accessibilité en austérité.

# Inspection fonctionnelle obligatoire

Cartographier les parcours existants : home, authentification, inscription, onboarding, profil, questionnaire, orientation, résultats, métiers, recommandations, formations, emploi, candidature, CV, tableau de bord, paramètres, administration, À propos, pages légales et navigation mobile.

Pour chaque parcours : objectif, entrée, étapes, données, persistance, erreurs possibles, problèmes UX, incohérences, dette, couverture de tests et risque de régression.

# Stratégie d’implémentation

Travailler par composants cohérents. Consolider lorsque pertinent : tokens, typographie, espacements, rayons, ombres, boutons, champs, badges, alertes, modales, cartes, navigation, loaders, skeletons, progressions, confirmations, états vides, composants photo–texte, frise, storytelling, tableau de bord et indicateurs de sauvegarde. Ne pas créer un design system parallèle si l’existant peut être amélioré.

# Images et médias

Vérifier licences et droits. Lorsque les images définitives ne sont pas disponibles : générer directement les visuels nécessaires avec un outil de création d’images ou fournir des prompts immédiatement exploitables ; ne jamais recourir à des placeholders ; prévoir les bonnes proportions ; documenter les besoins ; ne pas intégrer d’images non autorisées ; ne pas créer de faux témoignages ; ne pas présenter une illustration comme une personne réelle identifiée.

Préparer pour chaque visuel : sujet, scène, orientation, ratio, emplacement, intention émotionnelle, contraintes de représentation et texte alternatif.

# Tests obligatoires

Exécuter selon la stack réelle : lint, typecheck, unitaires, intégration, end-to-end, build production, routes principales, formulaires, erreurs, persistance, autosave, double soumission, chargements, responsive, clavier, contrastes, console, réseau et CI.

Ne jamais prétendre avoir exécuté un scénario non observé. Pour tout échec préexistant : commande, résultat, cause probable, preuve d’antériorité ou d’indépendance et risque résiduel.

# Validation visuelle et fonctionnelle

Lancer l’application et observer réellement : home, navigation, mobile, desktop, console, CTA, connexion ou parcours de démonstration, tableau de bord, progression, formulaires, erreurs, persistance, chargements, actions désactivées, cohérence et direction artistique. La présence d’un composant dans le code ne prouve pas son bon affichage.

# Git, PR et CI

Travailler sur une branche propre. Avant commit : vérifier diff, fichiers accidentels, secrets, fichiers générés, tests, dépendances et migrations.

La PR doit documenter problème, état initial, changements, décisions UX et techniques, preuves visuelles, tests, limites, risques et vérifications restantes. Surveiller la CI et corriger les échecs introduits.

Ne fusionner que si la fusion est autorisée, la CI acceptable, les revues satisfaites, aucun conflit ou risque critique identifié et le changement réellement prêt.

# Critères d’acceptation

## Direction artistique

- Makoki paraît humain et chaleureux.
- L’esthétique ne ressemble pas à une administration, banque ou fintech.
- Les personnes sont plus présentes que les icônes.
- Les pages ne sont pas une succession de cartes blanches.
- La palette est enrichie.
- Les formes de boussole et chemin sont cohérentes.
- Le mouvement sert la compréhension.

## Home

- Histoire en six moments.
- Hero humain fort.
- Bénéfices avant détails techniques.
- Méthodologies internes non dominantes.
- Fonctionnalités conformes à l’état réel.
- CTA final fort et contextualisé.

## Espace connecté

- Progression et accomplissements visibles.
- Prochaine étape claire.
- Erreurs non destructrices.
- Feedback de chargement.
- Actions impossibles expliquées.
- Raccourcis utiles.
- Sauvegarde fiable lorsqu’elle est nécessaire.

## Cohérence et validation

- Comportements similaires cohérents.
- États loading, success, empty et error gérés.
- Repères non déplacés arbitrairement.
- Composants réutilisables consolidés.
- Build et tests documentés.
- Interface réellement observée.
- CI consultée.
- Limites signalées.
- Aucune validation non observée revendiquée.

# Rapport final obligatoire

## A. État initial

Branche initiale, PR ouvertes, état de `main`, changements locaux, architecture, fonctionnalités et problèmes observés.

## B. Analyse des écarts

Pour chaque exigence : déjà satisfaite, partiellement satisfaite, non satisfaite, non vérifiable ou hors périmètre avec justification.

## C. Modifications réalisées

Fichiers, composants créés/refactorisés, contenus, parcours, corrections UX, décision RTK, persistance et tests.

## D. Validation

Pour chaque commande :

```text
Commande :
Résultat :
Statut :
Interprétation :
```

Distinguer conçu, implémenté, exécuté, testé et validé.

## E. GitHub

Branche, commits, PR, CI, revues et statut de fusion.

## F. Risques et inconnues

Risques résiduels, données manquantes, scénarios non testés, dépendances externes, production, besoins photographiques, contenu réel et témoignages manquants.

## G. Conclusion

Indiquer ce qui est terminé, seulement implémenté, validé, restant à valider, le niveau de confiance et la prochaine action recommandée.

# Instruction de démarrage pour tout agent

1. Ouvrir `/opt/orientationpro`.
2. Inspecter Git et les PR avant toute modification.
3. Lire ce fichier intégralement.
4. Cartographier l’architecture et les parcours.
5. Établir l’analyse des écarts.
6. Appliquer toutes les exigences sans omission.
7. Poursuivre de bout en bout sans micro-validation, sauf blocage réel.
