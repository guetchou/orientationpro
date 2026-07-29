# Gate de production Vague 5 — 2026-07-29

## Décision

**NO-GO pour activation publique.**

Cette décision est proportionnée aux preuves disponibles. Elle ne bloque pas la
préparation technique en PR brouillon et ne constitue pas une demande de fusion.

## Faits vérifiés

- V3-A, V3-B et V3-C sont fusionnés ; les autres lots V3 ne sont pas tous
  fusionnés au début du gate.
- V4-A est fusionné ; les autres lots V4 ne sont pas tous fusionnés.
- V5-A à V5-E existent en PR brouillon séparées, non fusionnées.
- tous les nouveaux defaults observés restent à `false`.
- sauvegarde/restauration MySQL réelle et migration up/down/up ont été prouvées
  sur MySQL jetable par V5-B ;
- V5-A a identifié routes legacy non gardées, absence de rate limiting,
  redaction non raccordée et vulnérabilités de dépendances hautes.

## Matrice de preuves

| Gate | Preuve exécutée | Résultat | Limite |
|---|---|---|---|
| CI complète | `npm run check` local | vert : 219 tests backend, typecheck, lint, build | branches V5 non fusionnées |
| backend/MySQL | suite complète locale | vert : 219/219 | MySQL CI/jetable, pas production |
| E2E navigateur | smoke public repository | vert : 15 routes et cycle consentement | Chromium seulement, pas toute la V3/V4 |
| charge | 300 appels santé isolés, concurrence 10 | vert : 0 échec, p95 18 ms, p99 33 ms | santé seulement, hôte local |
| panne/reprise | tests V3-C + rollback V5-B | vert dans les environnements jetables | pas chaos production |
| backup/restore | MySQL jetable, valeurs comparées | vert | pas volume production |
| migrations | 001–012 up/down/up | vert | cible jetable |
| sécurité | modèle, audit npm, permissions | no-go | correctifs non fusionnés |
| accessibilité | revue WCAG 2.2 | no-go | lecteur d'écran manuel absent |
| faible bande passante | résilience V3-C automatisée | partiel | réseau réel non observé |
| navigateurs cibles | Chromium smoke | partiel | Firefox/Safari absents |
| contenus publics | V4 partielle | no-go | validation humaine incomplète |
| mainteneur | accord explicite | absent | activation interdite |

## Bloquants

1. Fusion et gates complets des Vagues 3 et 4.
2. Routes legacy sensibles fermées ou authentifiées.
3. Rate limiting auth/charges coûteuses.
4. Logger V5-C raccordé et canaris de fuite validés bout en bout.
5. Vulnérabilités hautes corrigées ou acceptées formellement.
6. Droits de données exécutés de bout en bout.
7. Revue accessibilité clavier, lecteur d'écran, zoom 200 %, contraste et
   navigateurs cibles sur l'expérience intégrée.
8. Accord explicite du mainteneur.

## Conditions d'un futur go limité

Cohorte interne consentie, flags réversibles, arrêt d'urgence prouvé, aucune
revendication d'impact, support humain disponible, seuils d'alerte actifs et
fenêtre d'observation définie. Sans ces éléments, la décision reste `no-go`.

## Rollback du gate

Ce document et le script de charge sont non exécutés automatiquement. Revenir au
commit parent les retire sans effet runtime. Aucun service ni donnée n'est
modifié.
