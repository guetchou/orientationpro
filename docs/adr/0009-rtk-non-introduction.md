# ADR 0009 — Redux Toolkit non introduit

- Statut : accepté
- Date : 2026-07-30
- Décideurs : équipe MAKOKI

## Contexte

Le cahier d'exécution de la refonte Makoki (`docs/specs/makoki-refonte-ux-direction-artistique.md`) impose de trancher explicitement sur RTK avant toute implémentation :

> Déterminer d'abord si RTK signifie Redux Toolkit, RTK Query ou une autre abstraction du dépôt. Ne pas supposer silencieusement. […] Si RTK n'est pas installé, ne pas l'introduire seulement pour satisfaire nominalement la consigne. Évaluer bénéfice, coût de migration, compatibilité et problème réel résolu, puis documenter la décision.

## Constat

Inspection de `package.json` (racine et `backend/`) : aucune dépendance `redux`, `@reduxjs/toolkit`, `react-redux` ou `@rtk-query` n'est présente sur `main`. RTK (Redux Toolkit) n'a jamais été installé dans ce dépôt.

L'état applicatif réel repose sur :

- **État serveur** : `@tanstack/react-query` (`QueryClientProvider` dans `src/App.tsx`) pour les requêtes API, le cache, l'invalidation et les états loading/success/empty/error.
- **État global léger** : Context API (`useAuth`, `DemoProvider`) pour l'authentification et quelques préférences transverses.
- **État local** : `useState`/`useReducer` dans les composants et pages, y compris pour les parcours longs avec persistance (ex. brouillon RIASEC dans `localStorage`, `src/pages/RiasecTest.tsx`).

Aucun symptôme observé ne correspond à un problème que Redux Toolkit résoudrait mieux que cette combinaison :

- pas de state machine transverse complexe partagée par de nombreux composants déconnectés ;
- pas de besoin de time-travel debugging ou de middleware Redux spécifique ;
- React Query couvre déjà cache, revalidation et déduplication des appels API, qui est le problème que RTK Query cible en priorité.

## Décision

**Ne pas introduire Redux Toolkit.**

- Conserver React Query pour tout état dérivé du serveur.
- Conserver Context API pour l'état global réellement partagé (auth, préférences).
- Conserver l'état local pour ce qui est local à un composant ou un parcours.
- Réévaluer cette décision uniquement si un besoin concret apparaît : state machine partagée complexe, synchronisation multi-onglets avancée, ou dette réelle sur la gestion d'état actuelle — pas par convention nominale.

## Conséquences

- Aucune dépendance supplémentaire, aucun coût de migration, aucune incohérence d'architecture introduite pour satisfaire une consigne nominale.
- Les futurs lots de la refonte Makoki (dashboard, autosave, narration home) continuent d'utiliser React Query + Context + état local, conformément à l'existant.
