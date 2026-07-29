# Matrice d’exécution accessibilité et navigateurs

## Décision actuelle

**NO-GO.** Le 29 juillet 2026, Firefox Playwright et WebKit Playwright ont été
exécutés sur la page de connexion et des contrôles limités. Ces exécutions ne
remplacent ni Safari sur macOS, ni un lecteur d’écran, ni le parcours
authentifié. Aucun fichier de preuve ne doit être créé sans exécution réelle.

## Matrice obligatoire

| Cible | Scénarios minimaux | Preuve attendue |
|---|---|---|
| Firefox Playwright | connexion, fail-closed de `/parcours`, reflow, reprise hors ligne limitée | `firefox.json` |
| WebKit Playwright | connexion, fail-closed de `/parcours`, reflow, reprise hors ligne limitée | `webkit.json` |
| Safari réel sur macOS | connexion, `/parcours` authentifié, formulaires, hors ligne | `safari-macos.json` |
| lecteur d’écran | landmarks, titres, labels, erreurs, statut dynamique, focus | `screen-reader.json` |
| clavier/zoom/contraste | tabulation complète, aucun piège, zoom 200 %, focus visible, contraste | `keyboard-zoom-contrast.json` |

Chaque preuve suit `makoki.accessibility-evidence.v1` et contient le SHA Git
complet, la commande exacte, l’exécuteur, l’environnement et son OS, les
versions de l’application et de la cible, la date, les scénarios, le seuil, les
limites, les défauts, ainsi que le chemin et le SHA-256 de l’artefact. Un défaut
bloquant non résolu force `no-go`.

## Commande du gate

```bash
node --test scripts/release/accessibility-evidence-gate.test.cjs
npm run build
npm run test:e2e:accessibility
node scripts/release/accessibility-evidence-gate.cjs artifacts/accessibility
```

L’absence d’un fichier, une preuve invalide ou un résultat autre que `pass`
fait échouer la commande. La CI ne peut pas fabriquer une preuve manuelle de
lecteur d’écran ou de Safari réel. Le gate contrôle la structure et la
traçabilité déclarée ; il ne peut pas, à lui seul, prouver qu’un fichier JSON
correspond à une exécution réelle. Les rapports générés par l’outil et la revue
humaine restent obligatoires.

## Scénarios de revue

1. Atteindre tout contrôle au clavier et revenir sans perte d’état.
2. Identifier visuellement et vocalement le focus.
3. Comprendre les erreurs sans dépendre de la couleur.
4. Agrandir à 200 % sans perte de contenu ni défilement bidimensionnel indu.
5. Entendre les changements d’état, blocages et confirmations.
6. Réduire les animations et poursuivre le parcours.
7. Reprendre après interruption réseau avec message compréhensible.
8. Vérifier le langage simple et l’absence de diagnostic ou de promesse.

## Limites

Les résultats doivent porter sur la version intégrée finale. Une exécution sur
une branche antérieure ne satisfait pas le gate après rebase ou modification du
parcours. L’exécution automatisée actuelle ne couvre pas Safari macOS, le
lecteur d’écran, le zoom navigateur exact à 200 %, ni un parcours authentifié.
Le reflow à 320 px est un contrôle utile, pas une preuve de zoom 200 %.
