# Règles projet — texte visible (UI)

Ne recopie jamais dans l'interface les phrases servant à expliquer le besoin, débattre d'une solution ou décrire une règle métier.

Avant d'ajouter un texte visible, classe-le :
- **Exigence fonctionnelle** (ce que le système doit faire) → ne pas afficher tel quel.
- **Contrainte technique** (auth, permissions, base de données, API, feature flags, architecture) → jamais du contenu UI sans demande explicite.
- **Contenu éditorial validé** (titre, bouton, description, message d'erreur, texte marketing explicitement demandé) → affichable.

Ne transforme jamais une exigence en slogan, titre, badge ou bouton. En cas de doute : implémente le comportement, conserve les libellés existants, n'ajoute aucun texte visible. Demande-toi toujours : ce texte a-t-il été explicitement demandé comme contenu visible, ou sert-il seulement à expliquer la fonctionnalité ?
