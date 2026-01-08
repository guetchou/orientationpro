
# Documentation Technique - Dashboard Conseiller & Admin

## Architecture

Le projet est construit avec les technologies suivantes :
- React + TypeScript
- Supabase (Backend as a Service)
- TanStack Query (Gestion du cache et des requêtes)
- Shadcn/UI (Composants UI)
- Vitest (Tests unitaires)

## Structure du Projet

```
src/
├── components/
│   ├── dashboard/        # Composants du dashboard
│   ├── ui/              # Composants UI réutilisables
│   └── admin/           # Composants administration
├── hooks/               # Custom hooks
├── utils/              # Utilitaires et helpers
├── types/              # Types TypeScript
└── pages/              # Pages de l'application
```

## Système de Cache

Le système de cache utilise TanStack Query avec les configurations suivantes :
- `staleTime`: 5 minutes (durée avant revalidation)
- `cacheTime`: 30 minutes (durée de conservation en cache)

## Gestion des Erreurs

Un système centralisé de gestion des erreurs est implémenté dans `errorHandler.ts`.
Caractéristiques :
- Capture des erreurs globales
- Notifications via toast
- Logging structuré

## Tests

Les tests sont écrits avec Vitest et Testing Library.
Pour lancer les tests :
```bash
npm run test
```

## Performance

Optimisations implémentées :
- Mise en cache des requêtes avec TanStack Query
- Lazy loading des composants lourds
- Pagination des listes
- Debouncing des recherches

## Notifications

Le système de notifications utilise :
- Emails via Supabase Edge Functions
- SMS via API tierce (à configurer)
- Notifications in-app via toast

## Export PDF

Utilisation de jsPDF et html2canvas pour :
- Export des rapports
- Export des statistiques
- Documents personnalisés

## Rappels Automatiques

Configuration via Supabase :
- Scheduled functions pour les rappels
- Edge Functions pour l'envoi
- Queue de traitement asynchrone

## Points d'Attention

1. Sécurité :
   - Validation des entrées
   - RLS Supabase
   - Gestion des rôles

2. Performance :
   - Pagination
   - Mise en cache
   - Lazy loading

3. Maintenance :
   - Tests unitaires
   - Documentation
   - Logging
