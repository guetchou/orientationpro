# Gate accessibilité WCAG 2.2

## Conclusion

**NO-GO.** Le gate vise le niveau AA, mais les preuves disponibles sont
incomplètes. Aucun statut de conformité n’est revendiqué.

## Faits observés

- Firefox Playwright 150.0.2 et WebKit Playwright 26.4 ont exécuté 8 tests sur
  le SHA de contenu `b607a2d430ab66d18d5b155740b0039adcdf42c0` ;
- les labels de connexion, le contraste du séparateur et la cible du bouton
  d’affichage du mot de passe ont été corrigés ;
- axe ne rapporte plus de violation parmi les règles A/AA sélectionnées sur la
  page de connexion ;
- le flag du parcours reste désactivé par défaut et `/parcours` échoue fermé ;
- le reflow à 320 px et une recharge hors ligne limitée passent dans les deux
  moteurs.

## Preuves manquantes

- Safari réel sur macOS ;
- lecteur d’écran réel ;
- zoom navigateur exact à 200 % ;
- navigation clavier complète et focus sur tous les états ;
- parcours authentifié, blocage, reprise et réorientation ;
- reprise sous faible bande passante sans perte d’état.

WebKit Playwright n’est pas Safari. Un viewport à 320 px n’est pas une preuve de
zoom à 200 %. Axe et une interface qui s’affiche ne prouvent ni la compréhension
ni l’utilisabilité complète. Les fichiers exigés par
`scripts/release/accessibility-evidence-gate.cjs` restent donc manquants et le
gate doit retourner `no-go`.
