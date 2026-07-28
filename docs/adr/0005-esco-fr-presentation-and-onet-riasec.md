# ADR 0005 — Présentation française ESCO et profils RIASEC O*NET

- Statut : proposé pour implémentation
- Date : 2026-07-28
- Périmètre : catalogue métiers MAKOKI

## Contexte

Le catalogue initial stocke O*NET 30.3 en anglais et l’interface française demandait explicitement `locale=en`. Traduire seulement les textes de l’interface aurait laissé la recherche, les descriptions et les compétences en anglais et aurait rendu la provenance ambiguë.

## Décision

MAKOKI conserve les occupations O*NET comme identité fonctionnelle du classement et comme seule source des six scores RIASEC. ESCO 1.2.1 fournit une couche de présentation française séparée : libellés, descriptions, synonymes, compétences et relations métier-compétence.

La stratégie de restitution est :

```text
locale demandée fr
→ crosswalk O*NET–ESCO officiel ou revu vers une occupation ESCO fr active
→ contenu descriptif ESCO fr + identité et profil RIASEC O*NET
→ sinon contenu O*NET en avec fallbackLocale=en et translationStatus=unavailable
```

Une liaison `proposed` n’est jamais utilisée pour présenter du contenu comme fiable. Les statuts sont `proposed`, `official`, `reviewed` et `rejected`. `official` signifie que la ligne provient du crosswalk publié par la Commission européenne ; il ne signifie pas qu’une revue locale Congo a été réalisée.

## Modèle et compatibilité

Les tables de la migration 003 sont réutilisées. La migration 006 enrichit seulement `career_occupation_crosswalks` avec : niveau de confiance, statut de revue, référence/version de source et date de mapping. Le score numérique devient nullable afin de ne pas fabriquer un chiffre lorsque la source officielle ne le fournit pas.

L’identifiant public et `sourceCode` restent O*NET pour préserver les consommateurs actuels. L’API ajoute `presentationSource`, `riasecSource`, `translationStatus`, `fallbackLocale` et `crosswalk`.

## Import

L’import ESCO est explicite (`npm --prefix backend run import:esco`), transactionnel, idempotent, versionné et protégé par empreinte SHA-256. Il accepte un paquet officiel local ou une URL explicite, utilise un cache local, vérifie les volumes minimums et ne remplace pas silencieusement une version déjà importée. Les annotations locales, alias locaux et décisions humaines ne sont pas écrasés.

## Conséquences et limites

- Le matching RIASEC reste strictement inchangé et traçable à O*NET.
- Seules les occupations possédant un crosswalk officiel ou revu disposent d’un contenu ESCO français.
- Les métiers non rapprochés restent visibles en anglais avec un indicateur explicite.
- La pertinence locale pour le Congo demeure une couche éditoriale indépendante.
- Un import complet doit être validé sur un paquet officiel dont l’empreinte et les volumes réels sont consignés ; une fixture ne prouve pas la couverture totale du catalogue.
