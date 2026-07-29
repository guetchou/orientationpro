# Environnements V5-B

| Environnement | Données | Accès | Déploiement | Activation |
|---|---|---|---|---|
| développement | synthétiques | développeurs | local | flags OFF par défaut |
| test | jetables | CI | automatique isolé | activation ciblée par test |
| préproduction | anonymisées/synthétiques | équipe autorisée | promotion manuelle | cohorte interne uniquement après gates |
| production | réelles | moindre privilège | approbation mainteneur | interdite avant V3/V4 et gate final |

Les fichiers sous `scripts/release/environments/` ne contiennent aucun secret et
fixent tous les flags à `false`. Ils servent de garde-fou, pas de configuration
complète. Les secrets sont injectés par le gestionnaire de l'environnement et ne
sont jamais copiés dans un log ou artefact.
