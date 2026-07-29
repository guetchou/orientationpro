# Runbook d'audit V5-A

Exécuter dans un clone propre avec Node 20 :

```bash
npm ci
npm --prefix backend ci
npm run security:repository
npm run security:dependencies
npm run test:backend
```

Pour chaque échec, consigner la preuve non sensible, l'exploitabilité, le
correctif, le propriétaire et l'échéance. Aucune dérogation silencieuse.

Rollback V5-A : revenir au commit précédent de la branche. Le helper de
redaction n'est pas raccordé au serveur et les flags restent désactivés ; son
retrait ne modifie donc aucun comportement runtime.
