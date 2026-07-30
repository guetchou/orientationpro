# Matrice UX des frictions réelles — Makoki

> **Statut : document vivant, source de vérité pour la priorisation des lots de correction UX.** Complète `docs/specs/makoki-refonte-ux-direction-artistique.md` et la section « Principes UX complémentaires » de l'Issue #140. Ne remplace ni l'un ni l'autre.

## Méthode et périmètre

Audit fondé sur lecture de code réelle (`origin/main` après fusion des PR #141–#146), avec citations `fichier:ligne`. Les 25 axes listés dans l'Issue #140 sont évalués **par page**, uniquement lorsqu'ils sont pertinents pour cette page — pas de forçage mécanique d'un axe non applicable (ex. « suppression en cascade » n'est pas évalué sur une page en lecture seule).

**Rappel explicite (ne pas mécaniser)** : un principe général ne devient pas une règle uniforme. Le poids réel de l'action détermine la solution — voir les mises en garde dans l'Issue #140. Les hypothèses de type motivation/capacité/prompt restent des hypothèses tant qu'aucune donnée d'usage ne les confirme.

**Statuts utilisés** :
- `INSPECTÉ` — vérifié par lecture de code uniquement, comportement réel non observé dans un navigateur.
- `IMPLÉMENTÉ (PR non fusionnée)` — correctif écrit et testé (tests réels exécutés), mais vivant uniquement sur une branche/PR ouverte : **pas encore vrai sur `main`**. Un document source de vérité ne doit jamais décrire ce statut comme « corrigé », « fait » ou « résolu » sans qualifier qu'il s'agit d'une PR non fusionnée.
- `CORRIGÉ / VALIDÉ` — fusionné sur `main` **et** observé réellement (Playwright, ou observation manuelle documentée). Seul statut qui autorise à dire qu'un défaut n'existe plus dans le produit.
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
| 24. Titres | RiasecTest | `<h1 className="sr-only">Test RIASEC</h1>` présent dans les 4 branches de rendu | `RiasecTest.tsx:233,245,265,347` (fusionné sur `main`, PR #148) | Résolu | Hiérarchie de titres continue | — | P1 | **CORRIGÉ / VALIDÉ** — présence confirmée directement sur `main` (`grep`), 2 tests Playwright réels (firefox + webkit, 12/12) |
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
| 24. Titres | `<h1 className="sr-only">Mon profil</h1>` présent une fois au niveau de `Profile.tsx` (pas dans `AdaptiveProfileWizard`, qui n'est qu'un des 3 sous-composants de la page) | `Profile.tsx:15` (fusionné sur `main`, PR #148) | Résolu | Hiérarchie de titres continue | — | P1 | **CORRIGÉ / VALIDÉ** — présence confirmée directement sur `main` (`grep`), 2 tests Playwright réels (firefox + webkit, 12/12) |
| 24. Titres (résiduel) | Saut h1→h3 : le nouveau `<h1>` est immédiatement suivi d'un `<h3>` (`CardTitle`), pas d'un `<h2>` intermédiaire | `AdaptiveProfileWizard.tsx:356`, `ProfileHypothesisPanel.tsx`, `ProfileSynthesisPanel.tsx` | Faible — règle axe `heading-order` est une *best-practice* (`cat.semantics`), non mappée à un critère WCAG (pas de tag `wcag2a`/`wcag2aa`) | Hiérarchie continue si possible sans changement disproportionné | Changer le niveau sémantique de `CardTitle` dans ces contextes précis, ou accepter le saut — décision de composant partagé, hors périmètre du lot #148 | P2 | INSPECTÉ (trouvé en écrivant le test du lot #148, non corrigé) |
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

## J. Découvertes en écrivant les tests du lot #148 (h1 RiasecTest/Profile)

Deux défauts d'accessibilité réels et **distincts** du sujet du lot, trouvés en exécutant un scan axe complet sur `/tests/riasec` et `/profile` avant de restreindre le scan aux règles de structure de titres. Non corrigés dans le lot #148 pour ne pas mélanger les catégories de défauts — à traiter dans des lots séparés.

| Axe | Page(s) | Comportement observé | Preuve | Risque | Règle UX | Correction proposée | Priorité | Statut |
|---|---|---|---|---|---|---|---|---|
| 24. Structure de liste | Global (composant Sonner / toasts, donc potentiellement toute page affichant un toast) | `<li role="status">` à l'intérieur du `<ol class="toaster">` casse la sémantique de liste pour axe (règle `list`, `only-listitems`) | Scan axe réel sur `/tests/riasec` avec session simulée, violation `id: "list"`, cible `.toaster` | Lecteur d'écran : la liste de notifications n'est pas annoncée comme une liste cohérente | Structure de liste valide (`<li>` sans rôle qui neutralise `listitem`, ou wrapper hors `<ol>`) | À investiguer dans le composant Sonner partagé (`src/components/ui/sonner.tsx` ou équivalent) — probablement globale, pas spécifique à une page | P1 (composant partagé, large surface) | VALIDÉ (violation axe réelle observée, non corrigée) |
| 24. Contraste | `/profile` (`AdaptiveProfileWizard`) | Badge « Complété à X % » (`variant="secondary"`, `bg-secondary text-secondary-foreground`) ne respecte pas le ratio de contraste WCAG AA 4,5:1 | Scan axe réel, violation `id: "color-contrast"`, cible `.text-2xl` (le badge), `expectedContrastRatio: "4.5:1"` | Lisibilité réduite, notamment en malvoyance | Contraste AA minimum sur le texte informatif | Ajuster la classe de couleur du badge `secondary` dans ce contexte, ou le variant utilisé | P1 | VALIDÉ (violation axe réelle observée, non corrigée) |

## I bis. Axes vérifiés en marge de la préparation du lot #148

| Axe | Constat | Preuve | Priorité | Statut |
|---|---|---|---|---|
| 25. Responsive 320px | Aucun débordement horizontal confirmé sur 6 pages réelles (`/tests`, `/conseiller`, `/tests/riasec`, `/dashboard`, `/profile`, `/careers`) | Mesure réelle `document.documentElement.{clientWidth,scrollWidth}` via Playwright, viewport 320×640, session simulée | — | **VALIDÉ** (conforme) |
| 24. Reduced motion | **Correction d'un constat antérieur de cette même passe** : la toute première analyse de ce dossier (début de session) affirmait l'existence de règles CSS globales `@media (prefers-reduced-motion: reduce)` dans `src/index.css`. Vérification directe : **0 occurrence** de `reduced-motion` dans ce fichier. Seul `Home.tsx` (+ `PremiumAnimations.tsx`, spécifique à Home) appelle `useReducedMotion()`. `framer-motion` est importé dans 21 autres fichiers `pages/`/`features/` sans aucune protection reduced-motion | `grep -c "reduced-motion" src/index.css` → `0` ; `grep -rl "useReducedMotion" src` → 2 fichiers seulement ; `grep -rl "from 'framer-motion'" src/pages src/features` → 21 fichiers | Utilisateurs sensibles au mouvement (vestibulaire) non protégés sur la quasi-totalité du produit, uniquement sur la home | P1 (systémique, composant/pattern partagé) | VALIDÉ (gap confirmé) |
| 23. Interruptions/newsletters | Formulaire newsletter trouvé (`Footer.tsx:181`), mais **passif** (bas de page, pas de popup/modale), rendu globalement via `AppRouter.tsx:173` — n'interrompt aucune tâche en cours | `Footer.tsx:178-193`, recherche exhaustive de popups/modales newsletter ailleurs : 0 résultat | — | — | VALIDÉ (conforme) |

## I. Hors périmètre de cette passe

- Tableaux de bord internes (`admin/*`, `conseiller/dashboard`, `recruteur/dashboard`, `coach/dashboard`, `rh/dashboard`, `superadmin/dashboard`) et outils ATS admin — non audités. Décision de portée assumée (utilisateurs professionnels internes, pas le parcours grand public visé prioritairement), pas un oubli.
- Contraste des couleurs — non mesuré systématiquement au-delà de ce qui a été trouvé (piste `Progress` corrigée PR #146 ; badge `secondary` sur `/profile`, section J).
- Axes 19-20 (prompts au bon moment, classification motivation/capacité/prompt) — nécessitent des données d'usage réelles ou une observation utilisateur, pas seulement une lecture de code ; non traités ici, correctement laissés comme hypothèses à valider plutôt que déduits du code.

---

## Synthèse des écarts prioritaires

| # | Constat | Pages concernées | Priorité | Statut |
|---|---|---|---|---|
| 1 | **Absence systémique de `<h1>` sur les pages dont le titre visuel repose sur `CardTitle`** — 7 pages confirmées | 7 pages | **P1** | **2/7 corrigées et fusionnées sur `main`** (RiasecTest, Profile — PR #148, revalidé par un run Playwright direct post-fusion, 12/12) ; 5 restantes (VerifyEmail, RiasecResult, CareerMatches, CareerCatalog, OccupationDetail) |
| 2 | Aucune persistance locale dans `AdaptiveProfileWizard` pendant la saisie d'une étape (contrairement à `RiasecTest`) | `/profile` | P1 (hypothèse de perte de données à confirmer avant correction) | Non traité |
| 3 | Aucune persistance dans le flux CV Optimizer — perte du fichier/de la description en cas de rafraîchissement | `/cv-optimizer` | P1 | Non traité |
| 4 | Suppression immédiate sans option Annuler pour les compétences/formations du profil | `/profile` | P2 | Non traité |
| 5 | Champ téléphone sans explication d'usage | `/profile` | P2 | Non traité |
| 6 | CORS mal configuré → 500 au lieu de 403 | backend, register/login | P2 | Non traité |
| 7 | Bug `getByLabel` sur `/register` (déjà signalé PR #145, non corrigé) | `/register` | P1 | Non traité |
| 8 | Structure de liste invalide dans le composant Sonner (toasts) — trouvé en testant le lot 1 | Global | P1 | Non traité |
| 9 | Contraste insuffisant du badge « Complété à X % » | `/profile` | P1 | Non traité |
| 10 | Saut de niveau h1→h3 résiduel après le lot 1 (règle best-practice, pas un critère WCAG) | `/profile` (et probablement d'autres pages utilisant `CardTitle` juste après un `<h1>`) | P2 | Non traité |
| 11 | Aucune protection `prefers-reduced-motion` en dehors de `Home.tsx` — 21 fichiers utilisent `framer-motion` sans vérifier ce réglage système | Quasi tout le produit sauf Home | P1 | Non traité (gap confirmé, corrige un constat erroné de la toute première analyse de cette passe qui affirmait une protection globale inexistante) |

## PR proposées (indépendantes, non mélangées)

1. ~~**Lot accessibilité — `<h1>` manquants (RiasecTest, Profile) + extension des tests a11y.**~~ **Fusionné sur `main` (PR #148).** `<h1 className="sr-only">` présent sur les 2 pages les plus centrales, 2 tests Playwright réels (firefox + webkit, 12/12) revalidés directement sur `main` après fusion.
2. **Lot accessibilité (suite) — `<h1>` sur VerifyEmail, RiasecResult, CareerMatches, CareerCatalog, OccupationDetail.** Même nature que le lot 1, non commencé.
3. **Lot `Register.tsx` — association label/input.** Correction ciblée du bug `FormControl`/`id` déjà signalé. Indépendant.
4. **Lot autosauvegarde `AdaptiveProfileWizard`.** Conditionné à une validation préalable de la perte de données réelle (voir Validations nécessaires). Ne pas coder avant cette validation.
5. **Lot persistance `CvOptimizerPage`.** Indépendant du lot 4 malgré la similarité conceptuelle.
6. **Lot suppression réversible avec Annuler (`AdaptiveProfileWizard`).** Indépendant.
7. **Lot CORS backend.** Indépendant — backend, pas frontend.
8. **Lot structure de liste Sonner (toasts).** Nouveau, trouvé en testant le lot 1. Composant partagé, large surface d'impact — à investiguer avant de coder (combien de pages affichent réellement un toast ? le correctif est-il local au composant ou nécessite-t-il de changer l'usage de `role="status"` sur le `<li>` ?).
9. **Lot contraste badge `secondary`.** Nouveau, trouvé en testant le lot 1. Vérifier si `bg-secondary`/`text-secondary-foreground` est utilisé ailleurs avec le même problème avant de corriger uniquement ce cas.
10. **Lot saut h1→h3 résiduel.** Nouveau, priorité basse (best-practice, pas un critère WCAG) — nécessite de changer le niveau sémantique de `CardTitle` dans des contextes précis, décision de composant partagé à ne pas prendre à la légère.
11. **Lot `prefers-reduced-motion` global.** Généraliser la protection déjà présente sur `Home.tsx` (pattern `Reveal` + `useReducedMotion()`) — probablement via un wrapper ou un hook partagé réutilisable plutôt que de dupliquer la logique dans 21 fichiers. À concevoir comme un composant/hook commun avant d'être appliqué partout, pas 21 corrections ad hoc.

## Dépendances entre lots

- Le lot 1 est fusionné sur `main` (PR #148). Les lots 2, 3, 6, 7, 8, 9, 10 sont indépendants entre eux et n'ont pas de dépendance sur le lot 1.
- Le lot 4 (autosauvegarde profil) **dépend d'une validation préalable** (test de perte de données réel) — ne pas l'implémenter avant.
- Le lot 8 (Sonner) et le lot 9 (contraste badge) touchent des composants partagés — vérifier leur usage repo-wide avant de coder, pas seulement sur la page où ils ont été trouvés.
- Aucun lot ne dépend des 8 axes encore non vérifiés (onboarding détaillé, préremplissage au-delà de ce qui est documenté, hiérarchie visuelle au-delà des titres, etc.) — ces axes restent à auditer avant de proposer d'autres lots.

## Risques

- Le lot 1 (fait) n'a introduit aucune régression visuelle (`sr-only`, aucun changement visible), confirmé par build + tests.
- Le lot 4 (autosauvegarde profil) ne doit pas être codé sur une simple intuition — l'instruction explicite est de vérifier avant d'agir automatiquement.
- Les lots 8 et 9 touchent des composants partagés (Sonner, Badge) — risque de régression plus large que les lots précédents si le correctif n'est pas vérifié sur tous les usages existants.
- Aucun des lots proposés ne touche de code de suppression irréversible ou de données financières — risque produit globalement faible.

## Validations nécessaires avant d'aller plus loin

- Confirmer par un test réel (fermer l'onglet à l'étape 3 de l'assistant profil, revenir) que la perte de données décrite au lot 4 se produit effectivement, avant de la corriger.
- Lot 1 fusionné — la couverture a11y CI reste à étendre aux 5 pages restantes du constat n°1 (lot 2).
- Revue humaine sur le choix `sr-only` (fait pour le lot 1) vs `<h1>` visible pour les 5 pages du lot 2 (décision de direction artistique, pas seulement technique).
- Avant les lots 8/9 : recenser tous les usages de Sonner et du badge `secondary` dans le dépôt pour évaluer la surface réelle du correctif.

## Recommandation argumentée sur le prochain lot

**Lot 1 fusionné sur `main` (PR #148), revalidé après fusion.** Prochain lot recommandé : le lot 2 (h1 sur les 5 pages restantes — même nature, risque tout aussi faible, bénéfice immédiat, aucune dépendance). En parallèle : la validation de perte de données sur `AdaptiveProfileWizard` (lot 4), qui doit précéder tout code d'autosauvegarde. Le lot 8 (Sonner) mérite d'être recensé rapidement (surface d'impact) avant d'être priorisé, sans être nécessairement le prochain codé.
