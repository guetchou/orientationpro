# Suivi des travaux : GitHub

Les issues et PRD de ce dépôt sont publiés dans GitHub Issues avec `gh` exécuté depuis le clone du dépôt.

## Conventions

- Créer : `gh issue create --title "..." --body-file <fichier>`.
- Lire : `gh issue view <numéro> --comments`.
- Lister : `gh issue list --state open --json number,title,body,labels`.
- Commenter : `gh issue comment <numéro> --body-file <fichier>`.
- Ajouter ou retirer un label : `gh issue edit <numéro> --add-label <label>` ou `--remove-label <label>`.
- Fermer : `gh issue close <numéro> --comment "..."`.

Quand un skill demande de publier vers le suivi officiel, créer une GitHub Issue dans `guetchou/orientationpro`.
