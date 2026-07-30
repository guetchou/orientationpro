# V5-G — protocole de preuve d’accessibilité manuelle

Ce protocole ne constitue pas une preuve d’exécution. Une case cochée, une capture
isolée ou une CI verte ne suffisent pas. Chaque suite doit être exécutée sur le
même SHA candidat et produire un enregistrement JSON plus un artefact brut
restreint (journal horodaté ou vidéo).

## Environnements obligatoires

1. `safari-voiceover` : macOS et Safari réels, VoiceOver activé.
2. `windows-nvda` : Windows et Firefox ou Chrome réels, version NVDA relevée.
3. `keyboard-zoom` : navigateur réel à 200 %, clavier seul, sans outil
   d’automatisation pour les observations.

Pour chaque environnement, parcourir authentification, création, clarification,
scénario, plan, action, blocage, reprise et réorientation. Relever :

- ordre du focus et focus visible ;
- absence de piège clavier et retour arrière possible ;
- menus, formulaires, dialogues et erreurs utilisables sans pointeur ;
- erreurs et changements dynamiques annoncés par le lecteur d’écran ;
- contenu lisible à 200 % sans perte d’information ou d’action ;
- limites, hypothèses, inconnues et provenance compréhensibles.

## Format traçable

Créer `<suite>.json` à côté de l’artefact :

```json
{
  "gitSha": "SHA complet",
  "executedAt": "date ISO-8601",
  "executor": "identité du testeur",
  "environment": "OS, navigateur et lecteur d’écran avec versions",
  "result": "pass ou fail",
  "artifact": "chemin relatif sans secret",
  "artifactSha256": "SHA-256",
  "observations": ["faits observés et défauts"]
}
```

Le répertoire doit être persistant, à accès restreint, hors `/tmp`. Valider avec :

```bash
node scripts/release/v5g-manual-evidence-gate.cjs /chemin/persistant/v5g/SHA/accessibility
```

Un fichier absent, invalide, d’un autre SHA, ou un résultat `fail` maintient le
NO-GO. Ne jamais enregistrer de cookie, token, mot de passe, document brut ou
réponse sensible dans ces artefacts.
