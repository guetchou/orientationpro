# Revue accessibilité WCAG 2.2

## Cible

Niveau AA pour la future expérience intégrée. La revue suit POUR : perceptible,
utilisable, compréhensible et robuste.

## Vérifications requises

- alternatives textuelles et noms accessibles des boutons icônes ;
- contraste texte 4,5:1, composants/focus 3:1 ;
- clavier complet, ordre logique, aucun piège, lien d'évitement ;
- focus visible et non masqué par les barres fixes ;
- cibles au moins 24 × 24 CSS px ;
- réduction des animations ;
- langue de page, landmarks, titres et labels ;
- erreurs annoncées, `aria-invalid`, aide cohérente ;
- zoom 200 %, fort contraste et lecteur d'écran ;
- alternative aux gestes et fonctionnement faible bande passante.

## Conclusion actuelle

Les tests automatisés et le smoke Chromium peuvent détecter certaines
régressions, mais ne valident pas lecteur d'écran, ordre de focus réel, contraste
de chaque état, zoom, Safari/Firefox ou compréhension. Tant que ces essais
manuels sur la version intégrée ne sont pas consignés, l'accessibilité reste un
bloquant de production et non une conformité revendiquée.
