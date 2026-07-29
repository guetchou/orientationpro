# ADR-004 — Persistance MySQL du projet de vie v1

Statut : accepté pour W1-A

## Décision

Le contrat `makoki-life-project-v1` est persisté dans un graphe relationnel InnoDB normalisé : projet, scénarios, sélection active, critères, plans, actions et événements.

Les opérations d’écriture multi-tables sont transactionnelles. La ligne du projet porte un `lock_version` utilisé pour le verrouillage optimiste. Lors d’une mise à jour, la ligne est relue avec `SELECT ... FOR UPDATE`, les événements déjà persistés doivent constituer un préfixe strictement identique de l’historique entrant, puis seuls les nouveaux événements sont ajoutés.

## Raisons

- garantir l’isolation par compte via `owner_account_id` ;
- empêcher les références orphelines grâce aux clés étrangères composites ;
- conserver l’historique sans le réécrire ;
- permettre à l’API future de détecter les écritures concurrentes ;
- garder les objets relisibles selon le contrat v1 sans introduire de moteur événementiel externe.

## Modèle

```text
life_projects
  ├── life_project_scenarios
  │     ├── life_project_active_scenarios
  │     └── life_project_action_plans
  │            └── life_project_action_items
  ├── life_project_criteria
  └── life_project_events
```

La sélection active est une relation séparée afin que la base garantisse que le scénario appartient au même projet, sans créer de cycle de clés étrangères entre le projet et ses scénarios.

## Historique

`life_project_events` utilise un identifiant stable et une séquence unique par projet. Le store :

1. verrouille la ligne du projet ;
2. vérifie `expectedVersion` ;
3. compare le préfixe historique persisté ;
4. remplace transactionnellement l’état courant des scénarios, critères et plans ;
5. ajoute uniquement les nouveaux événements ;
6. incrémente `lock_version`.

Les suppressions du compte propriétaire entraînent la suppression en cascade du projet et de ses données. Aucune suppression fonctionnelle du projet n’est exposée dans W1-A ; une politique de conservation devra être décidée avant une API de suppression.

## Limites

- aucune route HTTP ou interface utilisateur ;
- aucun stockage de fichiers justificatifs ;
- aucune validation juridique ou scientifique ;
- les JSON conservent provenance, incertitude et listes descriptives, tandis que les relations structurelles restent normalisées ;
- les identifiants enfants sont globalement uniques dans cette version et doivent être générés comme identifiants stables.

## Validation

- tests unitaires des invariants append-only et chronologiques ;
- tests MySQL d’écriture, lecture, isolation de compte et concurrence optimiste ;
- preuve de rollback transactionnel après collision d’un enfant ;
- contrainte de sélection active testée directement en base ;
- cycle migration 011 descendant puis remontant.