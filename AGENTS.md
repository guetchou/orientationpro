# Règles du dépôt

Les règles globales de sécurité, d'audit, de sauvegarde, de preuve et de validation fournies au démarrage de l'agent restent obligatoires.

## Agent skills

### Issue tracker

Les travaux et PRD sont suivis dans GitHub Issues. Voir `docs/agents/issue-tracker.md`.

### Triage labels

Le vocabulaire est `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` et `wontfix`. Voir `docs/agents/triage-labels.md`.

### Domain docs

Le dépôt utilise un contexte unique avec `CONTEXT.md` et les décisions dans `docs/adr/`. Voir `docs/agents/domain.md`.

## Discipline produit / contenu UI

Ces règles s'appliquent à Codex, ChatGPT et à tout agent qui modifie une interface Makoki.

### Spécification ≠ contenu affiché

Par défaut, toute phrase provenant d'un prompt, ticket, commentaire, discussion, note métier, exemple, critère d'acceptation ou document de cadrage est une **instruction de travail**. Elle ne doit jamais être copiée, paraphrasée ou exposée dans l'interface publique.

Un texte ne peut être ajouté à l'interface que lorsqu'il est explicitement identifié comme : `Texte UI`, `Titre`, `Description`, `Libellé`, `CTA`, `Message utilisateur` ou `Contenu public validé`.

En cas de doute, conserver le texte public existant ou signaler qu'un contenu doit être validé. Ne jamais inventer un texte visible pour combler un manque.

### Interdiction de contamination du brief

Ne jamais transformer en contenu public :

- une note interne ou une explication donnée au développeur ;
- le nom d'un organisme cité uniquement comme exemple ou source de travail ;
- une contrainte technique, un nom de feature flag ou un détail d'implémentation ;
- un critère d'acceptation ;
- une formulation de discussion telle que « sans compte », « mode invité », « feature activée », etc., sauf validation explicite comme libellé UI ;
- un exemple métier utilisé pour expliquer une fonctionnalité.

Les noms d'organismes, programmes, financeurs, écoles ou employeurs ne doivent apparaître que lorsqu'ils proviennent d'une donnée métier pertinente pour la situation de l'utilisateur et que le produit prévoit explicitement de les montrer à cette étape.

### Parcours utilisateur

Une exigence fonctionnelle comme « l'utilisateur peut commencer avant de créer un compte » décrit un comportement. Elle n'autorise pas un bouton ou un texte « Commencer sans compte ».

Avant d'ajouter un CTA, déterminer d'abord l'action naturelle du point de vue de l'utilisateur. Les libellés doivent décrire cette action, pas l'architecture du produit ou le mode d'authentification.

### Hiérarchie visuelle

- Ne pas utiliser `w-full` sur un bouton desktop par défaut.
- Un CTA peut être pleine largeur sur petit écran lorsqu'il y a une raison UX claire.
- À partir du breakpoint `sm`, préférer une largeur adaptée au contenu (`sm:w-auto`) pour les actions ordinaires.
- Ne pas donner le même poids visuel à plusieurs actions concurrentes sans justification.
- Les pages desktop doivent conserver des espaces respirants et une largeur de lecture maîtrisée.

### Contrôle obligatoire avant PR UI

Avant toute PR qui modifie une interface, vérifier :

1. toutes les chaînes visibles ajoutées ou modifiées ;
2. la raison utilisateur de chaque chaîne ;
3. qu'aucune note interne, exigence, exemple ou discussion n'a été convertie en contenu public ;
4. que les noms d'organismes affichés sont réellement pertinents à cette étape ;
5. la hiérarchie des CTA sur mobile et desktop ;
6. l'absence de jargon technique inutile ;
7. que les tests ne figent pas un mauvais libellé simplement parce qu'il existait auparavant.

La description de PR doit inclure une section `Audit contenu UI` résumant les textes visibles ajoutés, modifiés et supprimés.

### Règle Makoki spécifique

Le parcours d'orientation doit parler d'abord de la personne : intérêts, situation, possibilités, pistes, décisions et actions. Les organismes, dispositifs et sources locales sont des données de recommandation contextuelles ; ils ne doivent jamais devenir le sujet central du parcours simplement parce qu'ils existent dans le référentiel.

Lorsqu'un objectif est explicitement choisi, les recommandations institutionnelles doivent rester cohérentes avec cet objectif. Un dispositif d'entrepreneuriat ne doit pas être mis en avant pour une personne qui n'a pas choisi l'entrepreneuriat ; un service d'insertion ne doit pas être proposé comme piste principale hors d'un objectif d'emploi ou de reprise d'activité.
