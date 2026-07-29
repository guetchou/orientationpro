# Inventaire sécurité V5-A

## Surfaces

- v1 : auth, Profil, RIASEC, catalogue métiers, Documents CV ;
- legacy : auth, CV, candidats, emplois, ATS, Rendez-vous, messagerie,
  candidatures, matching, communication et scraping ;
- données : MySQL, volume CV et fichiers temporaires ;
- exploitation : Docker privé, proxy Nginx, stdout conteneur ;
- supply-chain : deux lockfiles npm et trois workflows GitHub Actions.

## Secrets

Noms attendus uniquement : `JWT_SECRET`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`,
`SMTP_PASSWORD`, `GOOGLE_OAUTH_CLIENT_SECRET`, `META_APP_SECRET`. Leur valeur
ne doit apparaître ni dans Git, ni dans une commande, un log, un artefact ou une
preuve. Rotation des valeurs historiques : inconnue, donc bloquante.

## Contrôles reproductibles

```bash
npm ci
npm --prefix backend ci
npm run security:repository
npm run security:dependencies
npm run test:backend
```

`security:repository` bloque les flags activés par défaut et les permissions
workflow non minimales ; les warnings représentent des risques connus, pas une
validation. `security:dependencies` bloque les vulnérabilités de production
hautes ou critiques.
