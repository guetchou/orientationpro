# Matrice d’exécution accessibilité et navigateurs

## Décision actuelle

**NO-GO.** Chromium automatisé ne remplace ni Firefox, ni WebKit/Safari, ni une
revue avec technologie d’assistance. Aucun fichier de preuve ne doit être créé
sans exécution réelle.

## Matrice obligatoire

| Cible | Scénarios minimaux | Preuve attendue |
|---|---|---|
| Firefox dernière version stable | connexion, `/parcours`, erreur, reprise | `firefox.json` |
| WebKit/Safari cible | connexion, `/parcours`, formulaires, hors ligne | `webkit.json` |
| lecteur d’écran | landmarks, titres, labels, erreurs, statut dynamique, focus | `screen-reader.json` |
| clavier/zoom/contraste | tabulation complète, aucun piège, zoom 200 %, focus visible, contraste | `keyboard-zoom-contrast.json` |

Chaque preuve suit `makoki.accessibility-evidence.v1`, nomme l’exécuteur,
l’environnement, la date, les scénarios et les défauts. Un défaut bloquant non
résolu force `no-go`.

## Commande du gate

```bash
node --test scripts/release/accessibility-evidence-gate.test.cjs
node scripts/release/accessibility-evidence-gate.cjs artifacts/accessibility
```

L’absence d’un fichier, une preuve invalide ou un résultat autre que `pass`
fait échouer la commande. La CI ne peut pas fabriquer une preuve manuelle de
lecteur d’écran ou de Safari réel.

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
parcours.
