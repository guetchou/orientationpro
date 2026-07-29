# Remédiation des dépendances — 2026-07-29

## Décision

**NO-GO tant qu'une vulnérabilité haute ou critique exploitable reste sans
correctif ou acceptation formelle.** Une sortie `npm audit` n'est ni une analyse
d'exploitabilité ni une acceptation de risque.

## État observé avant resynchronisation

Le lot V5-A a rapporté, sur son environnement local :

- racine, dépendances de production : 19 vulnérabilités, dont 11 hautes ;
- backend, dépendances de production : 9 vulnérabilités, dont 6 hautes ;
- aucune critique dans ce relevé.

Le total « 86 alertes » provient d'un rapport externe de la Vague 4/5 et n'a pas
été recompté depuis l'interface de sécurité GitHub dans cette PR. Ces nombres
sont des preuves historiques à régénérer sur les lockfiles du dernier `main`.

## Procédure reproductible

```bash
npm ci
npm --prefix backend ci
npm audit --omit=dev --json > /tmp/root-audit.json || true
npm --prefix backend audit --omit=dev --json > /tmp/backend-audit.json || true
node scripts/security/dependency-report.cjs \
  --input root-production=/tmp/root-audit.json \
  --input backend-production=/tmp/backend-audit.json \
  > /tmp/dependency-risk-report.json
node --test scripts/security/dependency-report.test.cjs
```

Le rapport commence chaque entrée à `unreviewed`. Pour chaque vulnérabilité haute
ou critique, une revue humaine doit ajouter :

- dépendance et portée production/développement ;
- chemin réellement chargé ou atteignable ;
- entrée contrôlée par un utilisateur ou non ;
- version corrigée et rupture éventuelle ;
- tests de non-régression ;
- propriétaire et échéance ;
- décision : `fixed`, `mitigated`, `temporarily_accepted` ou `not_applicable` ;
- justification et mesures compensatoires ;
- date de réexamen pour toute acceptation temporaire.

## Limite actuelle

Aucun lockfile n'est modifié par ce lot : l'environnement GitHub Actions échoue
avant allocation d'un runner, et aucune mise à jour de dépendance ne doit être
fabriquée sans régénération reproductible du lockfile et exécution des tests.
Cette PR fournit donc la matrice et la méthode ; elle ne prétend pas avoir
corrigé les vulnérabilités signalées.
