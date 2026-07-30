# Matrice UX des frictions réelles — Makoki

> **Statut : document vivant, source de vérité pour la priorisation des lots de correction UX.** Complète `docs/specs/makoki-refonte-ux-direction-artistique.md` et la section « Principes UX complémentaires » de l'Issue #140. Ne remplace ni l'un ni l'autre.

## Méthode et périmètre

Audit fondé sur lecture de code réelle (`origin/main` après fusion des PR #141–#146), avec citations `fichier:ligne`. Les 25 axes listés dans l'Issue #140 sont évalués **par page**, uniquement lorsqu'ils sont pertinents pour cette page — pas de forçage mécanique d'un axe non applicable (ex. « suppression en cascade » n'est pas évalué sur une page en lecture seule).

**Rappel explicite (ne pas mécaniser)** : un principe général ne devient pas une règle uniforme. Le poids réel de l'action détermine la solution — voir les mises en garde dans l'Issue #140. Les hypothèses de type motivation/capacité/prompt restent des hypothèses tant qu'aucune donnée d'usage ne les confirme.

**Statuts utilisés** :
- `INSPECTÉ` — vérifié par lecture de code uniquement, comportement réel non observé dans un navigateur.
- `VALIDÉ` — observé réellement (Playwright, ou observation manuelle documentée).
- `NON VÉRIFIÉ` — pas encore examiné dans cette passe.
- `N/A` — axe non pertinent pour cette page.

**Priorités** : P0 (bloquant/casse un parcours), P1 (friction réelle et fréquente), P2 (amélioration, faible fréquence ou faible coût utilisateur).

**Hors périmètre de cette passe** : tableaux de bord internes (`admin/*`, `conseiller/dashboard`, `recruteur/dashboard`, `coach/dashboard`, `rh/dashboard`, `superadmin/dashboard`) et outils ATS admin — utilisateurs professionnels internes, pas le parcours grand public visé prioritairement par le cahier. Un futur passage devra les couvrir séparément.

---

## A. Parcours public (visiteur anonyme)

Pages : `Home.tsx` (`/`), `Tests.tsx` (`/tests`), `Conseillers.tsx` (`/conseiller`), `ProfessionalJobsPage.tsx` (`/jobs`), `About.tsx` (`/about`).

| Axe | Comportement observé | Preuve | Risque | Règle UX | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|
| 1. Clarté de la promesse | Hero avec titre bénéfice + CTA clair sur les 5 pages | `Home.tsx:154`, `Tests.tsx:134`, `Conseillers.tsx:141`, `ProfessionalJobsPage.tsx:42`, `About.tsx:51` | Faible | La promesse doit précéder l'action | Aucune — conforme | — | INSPECTÉ |
| 24. Structure des titres | h1 → h2 → h3 correcte, pas de saut de niveau | `Home.tsx:154,195,212` | Faible | Hiérarchie de titres continue | Aucune — conforme | — | INSPECTÉ |
| 2. Cohérence CTA → écran d'arrivée | CTA `/tests/riasec` mène directement à l'écran d'intro du test, pas à une page intermédiaire | `Home.tsx` CTA, `RiasecTest.tsx:260` (phase `intro`) | Faible | Le clic doit mener à ce qu'il promet | Aucune — conforme | — | INSPECTÉ |
| 5. Jargon exposé publiquement | Corrigé (PR #144) — RIASEC déplacé en légende secondaire sur `/tests` | `Tests.tsx:202` | — | — | — | — | VALIDÉ (Playwright, session précédente) |

## B. Authentification

Pages : `Register.tsx`, `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `VerifyEmail.tsx`.

| Axe | Page | Comportement observé | Preuve | Risque | Règle UX | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|---|
| 24. Titres | VerifyEmail | **Aucun `<h1>`** — le titre visible est `CardTitle`, qui rend un `<h3>` (`src/components/ui/card.tsx:34`) | `VerifyEmail.tsx:81` | Lecteur d'écran sans repère de niveau 1 | Hiérarchie de titres continue | Ajouter un `<h1>` (visuel ou `sr-only`) | P1 | INSPECTÉ |
| 24. Association label/input | Register | Bug confirmé (session précédente) : `label for=":r3:-form-item"` référence l'id du `<div>` englobant, pas celui de l'`<input>` — `Login.tsx` n'a pas ce défaut (id posé directement sur l'`<input>`) | `Register.tsx` (champ email/mot de passe), confirmé par `getByLabel()` Playwright échouant | Lecteur d'écran ne peut pas associer le label au champ | Association label/contrôle explicite | Poser l'`id` directement sur l'`<Input>`, comme dans `Login.tsx` | P1 | VALIDÉ (Playwright, session précédente) |
| 10. Double-soumission | Register, Login, ForgotPassword | Boutons principaux gardés par `disabled={submitting}` (+ validité de formulaire pour Register) | `Register.tsx:253`, `Login.tsx:196`, `ForgotPassword.tsx:97` | — | — | Aucune — conforme | — | INSPECTÉ |
| 21. Erreurs récupérables | Login | Message d'erreur générique observé en environnement isolé : « Ce compte doit être vérifié avant la connexion » — orienté solution (implique qu'il faut vérifier), pas un code d'erreur brut | Observation directe (validation staging isolée, session précédente) | Faible | Erreur compréhensible et actionnable | Aucune — conforme sur ce cas précis ; pas d'audit exhaustif de tous les messages d'erreur | — | VALIDÉ (staging isolé) |
| — | Register/Login | Défaut hors formulaire : origine CORS non whitelistée → 500 non géré au lieu de 403 propre | `backend/src/server.js` middleware `cors()` — `callback(new Error(...))` | Erreur opaque en cas de config CORS incorrecte (pas un défaut visible utilisateur en usage normal, uniquement en cas de mauvaise config d'environnement) | Erreur gérée proprement, pas une exception non catchée | Retourner un 403 JSON explicite plutôt que de laisser Express gérer l'erreur générique | P2 | VALIDÉ (staging isolé, session précédente) |

## C. Test d'orientation et résultats

Pages : `RiasecTest.tsx` (`/tests/riasec`), `RiasecResults.tsx` (`/orientation/results`), `RiasecResult.tsx` (`/orientation/results/:id`), `CareerMatches.tsx` (`/orientation/results/:id/careers`).

| Axe | Page | Comportement observé | Preuve | Risque | Règle UX | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|---|
| 24. Titres | RiasecTest | **Aucun `<h1>`** sur les écrans intro/erreur/question — uniquement `CardTitle` (h3) | `RiasecTest.tsx:283` (intro), `246` (erreur) | Page de tâche la plus utilisée du produit sans repère de niveau 1 | Hiérarchie de titres continue | Ajouter un `<h1>` | **P0** (page centrale du produit) | INSPECTÉ |
| 24. Titres | RiasecResult | **Aucun `<h1>`** — `CardTitle` (h3) uniquement | `RiasecResult.tsx:150` | Idem | Idem | Ajouter un `<h1>` | P1 | INSPECTÉ |
| 24. Titres | CareerMatches | **Aucun `<h1>`** — `CardTitle` (h3) uniquement | `CareerMatches.tsx:78` | Idem | Idem | Ajouter un `<h1>` | P1 | INSPECTÉ |
| 24. Titres | RiasecResults | Conforme — `<h1>` présent | `RiasecResults.tsx:57` | — | — | Aucune | — | INSPECTÉ |
| 7. Autosauvegarde | RiasecTest | Brouillon complet dans `localStorage`, restauration confirmée, message explicite affiché à l'utilisateur | Confirmé en environnement réel (session précédente : « Brouillon local repris sur cet appareil ») | — | — | Aucune — conforme, à généraliser ailleurs (voir D) | — | VALIDÉ (staging isolé) |
| 10. Double-soumission | RiasecTest | `disabled={... || phase === 'submitting'}` sur boutons Suivant/Précédent/Calculer | `RiasecTest.tsx:423,431,442` | — | — | Aucune — conforme | — | INSPECTÉ + VALIDÉ (test réel effectué en staging isolé, session précédente) |
| 9. Feedback de chargement | RiasecTest, RiasecResults, RiasecResult, CareerMatches | `Loader2` + texte explicite sur les 4 pages | `RiasecTest.tsx` (soumission), `RiasecResults.tsx:68`, `RiasecResult.tsx:96`, `CareerMatches.tsx:64` | — | — | Aucune — conforme | — | INSPECTÉ |
| 3. Onboarding / première valeur | Register → RiasecTest → résultat | Chemin réel mesuré en environnement isolé : inscription → vérification e-mail → connexion → passation (60 items) → résultat réel affiché, sans étape intermédiaire superflue | Validation staging isolée (session précédente, scénario 2) | Faible | Premier résultat de valeur rapide | Aucune correction identifiée — le chemin est déjà direct. Non mesuré : le temps réel perçu par un utilisateur humain (le test staging utilisait des réponses automatisées) | — | VALIDÉ partiellement (chemin confirmé direct, durée réelle humaine non mesurée) |
| 10. Double-soumission | CareerMatches | `freezeRanking()` gardé par `disabled={snapshotBusy}` | `CareerMatches.tsx:97` | — | — | Aucune — conforme | — | INSPECTÉ |

## D. Profil (`/profile`)

Composants : `AdaptiveProfileWizard.tsx`, `ProfileHypothesisPanel.tsx`, `ProfileSynthesisPanel.tsx`.

| Axe | Comportement observé | Preuve | Risque | Règle UX | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|
| 24. Titres | **Aucun `<h1>`** sur toute la page `/profile` — le premier titre est `CardTitle` « Mon profil intelligent » (h3) | `AdaptiveProfileWizard.tsx:356` | Page de tâche centrale (identité, objectif, formation, compétences) sans repère de niveau 1 | Hiérarchie de titres continue | Ajouter un `<h1>` | **P0** (page centrale, 5-6 étapes) | INSPECTÉ |
| 5. Préremplissage | E-mail du compte préaffiché en lecture seule dans l'étape identité | `AdaptiveProfileWizard.tsx:392` | — | Anticipation contextuelle | Aucune — conforme sur ce champ | — | INSPECTÉ |
| 7. Autosauvegarde entre étapes | Chaque étape sauvegarde côté serveur au clic sur « Enregistrer et continuer » (`saveProfileDetails`) — mais **aucune persistance locale au sein d'une étape en cours de saisie** | `AdaptiveProfileWizard.tsx:265` (`saveProfileDetails`), aucune occurrence de `localStorage` dans le fichier | Fermeture d'onglet ou perte de session **pendant** la saisie d'une étape (avant le clic « Enregistrer et continuer ») perd les champs en cours | Assistant multi-étapes → sauvegarde/restauration | Ajouter un brouillon local par étape (pattern déjà éprouvé dans `RiasecTest.tsx`), **après confirmation par un test de perte de données réel** (fermer l'onglet à l'étape 3, revenir) | P1 | INSPECTÉ, comportement de perte **non confirmé en conditions réelles** — hypothèse à valider avant de coder |
| 17. Suppression réversible sans confirmation ni annulation | Retrait d'une formation ou d'une compétence déclarée : suppression **immédiate**, aucune confirmation, **aucune option Annuler** | `AdaptiveProfileWizard.tsx:416` (formation), `432` (compétence) | Perte accidentelle d'une saisie sur un clic malencontreux, sans recours | Suppression locale réversible → immédiate **avec** Annuler (pas de confirmation bloquante — ce serait le mauvais correctif) | Ajouter un toast « Compétence retirée — Annuler » (pattern déjà cohérent avec le poids réel de l'action : ne pas ajouter de modale de confirmation, ce serait disproportionné) | P2 | INSPECTÉ |
| 22. Explication d'une info sensible | Champ téléphone marqué « facultatif » mais sans explication de l'usage prévu | `AdaptiveProfileWizard.tsx:391` | Faible (champ optionnel) | Expliquer pourquoi une info est demandée | Ajouter une micro-légende (ex. « pour vous recontacter en cas de rendez-vous ») | P2 | INSPECTÉ |
| 12. Cohérence des libellés | Bouton d'avancement dit « Enregistrer et continuer » (ou « Passer et continuer » si étape facultative vide), différent de « Suivant » utilisé dans `RiasecTest.tsx` | `AdaptiveProfileWizard.tsx:448` vs `RiasecTest.tsx` (« Suivant ») | Faible — nuance justifiable : ce bouton déclenche une vraie sauvegarde serveur, contrairement à RiasecTest où la sauvegarde est un brouillon local invisible | Cohérence des libellés **sans mécanisation** — un libellé différent peut être justifié si l'action diffère réellement | Ne pas unifier aveuglément ; documenter la distinction comme volontaire | P2 (documentation, pas de code) | INSPECTÉ |
| 10. Double-soumission | `disabled={saving}` sur le bouton d'avancement | `AdaptiveProfileWizard.tsx:448` | — | — | Aucune — conforme | — | INSPECTÉ |
| 14. Modales | Aucune modale utilisée dans tout l'assistant profil | Recherche exhaustive `Dialog`/`AlertDialog` dans `src/features/profile/` : 0 résultat | — | — | Aucune — rien à corriger | — | INSPECTÉ |

## E. Tableau de bord (`/dashboard`)

Déjà largement audité et corrigé dans les PR #145 et #146 (progression réelle via `completion_percent`, prochaine étape contextuelle, erreur + Réessayer, avatar, bug d'accessibilité `Progress` corrigé, chevauchement header corrigé). Non repris intégralement ici pour éviter la redondance — voir PR #145/#146 pour le détail complet avec preuves et validations réelles (8 scénarios authentifiés + observation production).

| Axe | Comportement observé | Statut |
|---|---|---|
| 4. Progression/historique/prochaine étape | Conforme, validé réellement (8 scénarios) | VALIDÉ |
| 9. Feedback de chargement | Conforme | VALIDÉ |
| 10. Double-soumission (Réessayer) | Conforme, testé réellement (interception réseau + clic Réessayer) | VALIDÉ |
| 24. Accessibilité (Progress, contraste) | 2 défauts trouvés et corrigés en production réelle (PR #146) | VALIDÉ |
| 20. Reste à évaluer | Actions impossibles expliquées, raccourcis avancés (axes listés comme restants dans le cahier initial, non traités) | NON VÉRIFIÉ |

## F. Métiers (`/careers`, `/careers/:id`)

Pages : `CareerCatalog.tsx`, `OccupationDetail.tsx`.

| Axe | Page | Comportement observé | Preuve | Risque | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|
| 24. Titres | CareerCatalog | **Aucun `<h1>`** — `CardTitle` « Explorer les métiers en français » (h3) | `CareerCatalog.tsx:70` | Page d'exploration principale sans repère de niveau 1 | Ajouter un `<h1>` | P1 | INSPECTÉ |
| 24. Titres | OccupationDetail | **Aucun `<h1>`** — `CardTitle` (h3) pour le nom du métier | `OccupationDetail.tsx:64` | Idem | Ajouter un `<h1>` | P1 | INSPECTÉ |
| 22. Transparence des sources | OccupationDetail affiche explicitement la langue réellement servie, le statut de pertinence locale et les sources distinctes (description vs RIASEC) | `OccupationDetail.tsx:64` (bloc « Sources distinctes ») | — | Conforme — bon exemple de transparence, à ne pas casser | — | — | INSPECTÉ |

## G. Projet de vie (`/parcours`)

Composants : `LifeProjectPage.tsx`, `AdaptiveJourneyPanel.tsx`.

| Axe | Comportement observé | Preuve | Risque | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|
| 24. Titres | `<h1>` présent | `LifeProjectPage.tsx:356` | — | Aucune — conforme | — | INSPECTÉ |
| 10. Double-soumission | `disabled={saving || !online}` / `disabled={saving || !online || cached}` sur les actions de sauvegarde | `LifeProjectPage.tsx:518`, `AdaptiveJourneyPanel.tsx:356` | — | Aucune — conforme | — | INSPECTÉ |
| 19. Feature flag et disponibilité | Écran explicite « Parcours MAKOKI non activé » si le flag est désactivé côté backend, pas un lien mort ou une page blanche | `LifeProjectPage.tsx:344` | — | Conforme — bon exemple | — | INSPECTÉ |
| 14. Modales | Aucune modale trouvée | Recherche exhaustive `Dialog`/`AlertDialog` dans `src/features/life-project/` : 0 résultat | — | Aucune | — | INSPECTÉ |

## H. CV et candidature

Pages : `CvOptimizerPage.tsx` (`/cv-optimizer`), `CvUploadStep.tsx`, `JobTargetStep.tsx`, `AtsAnalysisResult.tsx`, `CvAnalysisHistory.tsx` (`/cv-history`), `BookAppointment.tsx`.

| Axe | Page | Comportement observé | Preuve | Risque | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|
| 24. Titres | CvOptimizerPage, CVHistory, BookAppointment | `<h1>` présent sur les 3 | `CvOptimizerPage.tsx:61`, `CvAnalysisHistory.tsx:101`, `BookAppointment.tsx:32` | — | Aucune — conforme | — | INSPECTÉ |
| 6/7. Reprise de tâche interrompue | CvOptimizerPage | Flux `upload → target → analyzing → result` géré en `useState` local uniquement, **aucune persistance** (`localStorage`/`sessionStorage`) — un rafraîchissement à l'étape « target » (après upload, avant analyse) fait perdre le fichier importé et repartir de zéro | Recherche exhaustive : 0 occurrence `localStorage`/`sessionStorage` dans `CvOptimizerPage.tsx` | Perte du fichier CV importé + ressaisie de la description de poste en cas de rafraîchissement accidentel | Autosauvegarde de l'état de phase (pas nécessairement le fichier binaire lui-même, mais au minimum la description de poste saisie) | P1 | INSPECTÉ |
| 10. Double-soumission | JobTargetStep | `disabled={submitting}` sur les boutons Retour/Analyser | `JobTargetStep.tsx:64,69,76` | — | Aucune — conforme | — | INSPECTÉ |
| 10. Double-soumission | CvUploadStep | Bouton « Continuer » gardé par `disabled={!file}` uniquement — **vérifié non problématique** : ce bouton ne déclenche qu'une transition d'état locale synchrone (`setPhase('target')`), pas d'appel réseau ; l'analyse réelle se fait plus tard dans `JobTargetStep`, correctement gardée | `CvUploadStep.tsx:110`, `CvOptimizerPage.tsx:83-95` (le composant est démonté dès le changement de phase) | — | Aucune — hypothèse initiale de bug infirmée après vérification, documentée ici pour éviter qu'un futur agent reparte sur une fausse piste | — | INSPECTÉ |

## I. Hors périmètre de cette passe

- Tableaux de bord internes (`admin/*`, `conseiller/dashboard`, `recruteur/dashboard`, `coach/dashboard`, `rh/dashboard`, `superadmin/dashboard`) et outils ATS admin — non audités.
- Navigation mobile / responsive dédié (au-delà de la structure de titres) — non testé à 320px sur les pages listées ci-dessus, à l'exception de `/login` (couvert par `tests/accessibility/browser-accessibility.spec.ts`).
- `reduced motion` — vérifié uniquement sur `Home.tsx` (`Reveal` + `useReducedMotion()`) lors de l'audit initial ; non revérifié systématiquement sur les autres pages listées ici.
- Contraste des couleurs — non mesuré systématiquement (seul le défaut de piste `Progress` a été trouvé et corrigé, PR #146).
- Newsletters / annonces hors moments de concentration (axe 23) — aucune newsletter ou annonce modale trouvée dans le code à ce stade ; à confirmer qu'aucun mécanisme de ce type n'existe ailleurs (ex. notifications push, bannières).
- Axes 19-20 (prompts au bon moment, classification motivation/capacité/prompt) — nécessitent des données d'usage réelles ou une observation utilisateur, pas seulement une lecture de code ; non traités ici, correctement laissés comme hypothèses à valider plutôt que déduits du code.

---

## Synthèse des écarts prioritaires

| # | Constat | Pages concernées | Priorité |
|---|---|---|---|
| 1 | **Absence systémique de `<h1>` sur les pages dont le titre visuel repose sur `CardTitle`** — 7 pages confirmées : RiasecTest, AdaptiveProfileWizard, VerifyEmail, RiasecResult, CareerMatches, CareerCatalog, OccupationDetail | 7 pages, dont les 2 plus centrales du produit (RiasecTest, AdaptiveProfileWizard) | **P0/P1** |
| 2 | Aucune persistance locale dans `AdaptiveProfileWizard` pendant la saisie d'une étape (contrairement à `RiasecTest`) | `/profile` | P1 (hypothèse de perte de données à confirmer avant correction) |
| 3 | Aucune persistance dans le flux CV Optimizer — perte du fichier/de la description en cas de rafraîchissement | `/cv-optimizer` | P1 |
| 4 | Suppression immédiate sans option Annuler pour les compétences/formations du profil | `/profile` | P2 |
| 5 | Champ téléphone sans explication d'usage | `/profile` | P2 |
| 6 | CORS mal configuré → 500 au lieu de 403 | backend, register/login | P2 |
| 7 | Bug `getByLabel` sur `/register` (déjà signalé PR #145, non corrigé) | `/register` | P1 |

## PR proposées (indépendantes, non mélangées)

1. **Lot accessibilité — `<h1>` manquants + extension des tests a11y.** Ajout d'un `<h1>` (visible ou `sr-only` selon le design) sur `RiasecTest.tsx` et `AdaptiveProfileWizard.tsx` en priorité (P0/P1, pages les plus centrales), extension de `tests/accessibility/browser-accessibility.spec.ts` pour couvrir ces deux parcours. **Premier lot demandé, à traiter maintenant.**
2. **Lot accessibilité (suite) — `<h1>` sur VerifyEmail, RiasecResult, CareerMatches, CareerCatalog, OccupationDetail.** Même nature que le lot 1, séparé pour rester dans le même périmètre (accessibilité des titres) sans le mélanger à d'autres corrections, mais peut être une PR distincte pour rester petite et review-able.
3. **Lot `Register.tsx` — association label/input.** Correction ciblée du bug `FormControl`/`id` déjà signalé. Indépendant de l'accessibilité des titres (nature différente : association ARIA, pas structure de titres).
4. **Lot autosauvegarde `AdaptiveProfileWizard`.** Conditionné à une validation préalable de la perte de données réelle (voir Validations nécessaires). Ne pas coder avant cette validation.
5. **Lot persistance `CvOptimizerPage`.** Indépendant du lot 4 malgré la similarité conceptuelle — pages et code différents, pas de bénéfice à les mélanger.
6. **Lot suppression réversible avec Annuler (`AdaptiveProfileWizard`).** Indépendant — nature différente (pattern d'annulation, pas de persistance).
7. **Lot CORS backend.** Indépendant — backend, pas frontend.

## Dépendances entre lots

- Le lot 1 (h1 RiasecTest/AdaptiveProfileWizard) n'a aucune dépendance — peut démarrer immédiatement.
- Le lot 4 (autosauvegarde profil) **dépend d'une validation préalable** (test de perte de données réel) — ne pas l'implémenter avant.
- Les lots 2, 3, 6, 7 sont indépendants entre eux et du lot 1.
- Aucun lot ne dépend des 8 axes encore non vérifiés (onboarding détaillé, préremplissage au-delà de ce qui est documenté, hiérarchie visuelle au-delà des titres, etc.) — ces axes restent à auditer avant de proposer d'autres lots.

## Risques

- Le lot 1 touche des pages à fort trafic (test RIASEC, profil) — risque de régression visuelle si le `<h1>` ajouté n'est pas correctement stylé (`sr-only` recommandé pour ne pas perturber la direction artistique existante, à confirmer en revue).
- Le lot 4 (autosauvegarde profil) ne doit pas être codé sur une simple intuition — l'instruction explicite est de vérifier avant d'agir automatiquement.
- Aucun des lots proposés ne touche de code de suppression irréversible ou de données financières — risque produit globalement faible.

## Validations nécessaires avant d'aller plus loin

- Confirmer par un test réel (fermer l'onglet à l'étape 3 de l'assistant profil, revenir) que la perte de données décrite au lot 4 se produit effectivement, avant de la corriger.
- Étendre la couverture a11y CI au-delà de `/login` uniquement après le lot 1, pour que les nouveaux tests aient quelque chose à vérifier.
- Revue humaine sur le choix `sr-only` vs `<h1>` visible pour chaque page du lot 1 (décision de direction artistique, pas seulement technique).

## Recommandation argumentée sur le prochain lot

**Lot 1 (h1 RiasecTest + AdaptiveProfileWizard + extension tests a11y)**, pour trois raisons : (1) c'est le constat le mieux étayé de cette passe (7 pages confirmées par lecture directe du composant `CardTitle`, preuve non ambiguë) ; (2) il touche les deux pages où l'utilisateur passe le plus de temps concentré, donc le bénéfice d'accessibilité est le plus élevé ; (3) c'est un changement à risque de régression faible (ajout d'un élément, pas de modification de logique), cohérent avec la demande explicite de ne pas mélanger les catégories de correctifs. Les axes encore non vérifiés (onboarding détaillé, préremplissage au-delà de l'e-mail, hiérarchie visuelle au-delà des titres, responsive à 320px, reduced motion au-delà de Home) restent à auditer en parallèle ou juste après, avant de proposer les lots suivants — conformément à la demande de ne pas fermer l'Issue tant que tous les axes n'ont pas été évalués.
