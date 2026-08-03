# Campagne exploratoire — parcours invité → compte → rapport (#216.8)

Exécutée une fois la suite déterministe (critical-path/riasec-oracles/resilience.spec.ts,
19 tests) entièrement verte, contre le même environnement isolé jetable (MySQL +
backend + frontend, jamais la production, aucune donnée réelle de jeune).

Chaque scénario ci-dessous a été **réellement exécuté** (script Playwright
temporaire `tests/life-project/_exploratory.spec.ts`, supprimé après cette
campagne — les observations qui en valent la peine sont consignées ici, pas
le script lui-même). Garde-fou respecté : aucune observation n'est traitée
comme bloquante avant reproduction déterministe fiable ; aucune n'a entraîné
de modification d'une règle métier, d'un score attendu, d'une permission ou
d'un contrôle de sécurité.

## Observations

### 1. Bouton précédent du navigateur après complétion RIASEC
Deux `goBack()` successifs après avoir terminé le questionnaire ramènent sur
une page vide (`about:blank`), pas sur une étape antérieure du parcours ni
sur une erreur visible. Comportement attendu pour une SPA à route unique
sans historique interne poussé pendant le questionnaire (`currentIndex` n'est
pas reflété dans l'URL) — **pas une anomalie**, juste une limite connue de
l'architecture actuelle (une seule route `/parcours`, navigation interne par
état React). Ne bloque rien : l'utilisateur reste sur `/parcours` en pratique
puisque aucune navigation SPA n'a eu lieu pour alimenter l'historique.

### 2. Paramètres de requête inattendus (`?token=../../etc/passwd&<script>...`)
La page se charge normalement (intro RIASEC affichée), les caractères spéciaux
sont correctement encodés dans l'URL par le navigateur lui-même, aucune
exécution de script, aucune erreur console inattendue. **Pas d'anomalie** —
la route ne lit aucun de ces paramètres.

### 3. Caractères spéciaux et charge dans les champs libres de situation
Champ "Ville ou zone" rempli avec `<img src=x onerror=alert(1)>`, champ
"Situation actuelle" avec 20 000 caractères, champ "Autres centres d'intérêt"
avec emojis/retours à la ligne/tabulations. Résultat : **aucune boîte de
dialogue JS déclenchée** (le payload XSS n'est jamais exécuté — rendu en
texte échappé par React, comme attendu), page reste réactive après soumission.
**Pas d'anomalie** — confirme que le rendu React protège correctement contre
l'injection dans ces champs.

### 4. ⚠️ Régénérer "Préparer mes pistes" sans changer le formulaire efface silencieusement la piste choisie
Après avoir choisi une piste ("Approfondir cette piste" → synthèse imprimable
visible), relancer "Préparer mes pistes" **sans modifier aucun champ** génère
un nouveau jeu de recommandations. La piste précédemment choisie
(`activeScenarioId`) ne correspond à aucun des nouveaux identifiants, donc
`selectedScenario` redevient `null` et toute la section « Comparaison
complète » + synthèse imprimable (`#life-project-summary`) **disparaît sans
aucun avertissement**. L'utilisateur perd son choix (et l'accès à l'action
recommandée associée) sans confirmation ni message.

**Statut : observation UX réelle, pas un crash.** Reproduite une fois dans
cette campagne — pas encore reproduite plusieurs fois ni isolée en test
déterministe dédié. Je ne l'ai pas corrigée : modifier ce comportement serait
une décision produit (faut-il avertir avant de régénérer ? conserver le choix
s'il existe encore parmi les nouvelles pistes ?), hors du mandat de cette
campagne de tests. **Recommandation** : à trancher par le responsable produit,
puis à couvrir par un test déterministe dédié une fois la décision prise.

### 5. Timeout (90s) après régénération — isolé : artefact du script exploratoire, pas de l'application
Le même scénario (#4) dépassait systématiquement le timeout du test.
Reproduit deux fois (dont une fois isolément avec `--trace on`), puis isolé
via la trace réseau/actions Playwright : **toutes les requêtes réseau se
sont terminées normalement en 200 OK en moins de 300ms chacune** — aucune
requête ne restait en vol. La dernière action enregistrée avant le timeout
était mon propre appel `page.locator('#life-project-summary').textContent()`
dans le script exploratoire, sans timeout borné explicite, sur un élément
qui — précisément à cause de l'observation #4 — n'existe plus dans le DOM
après régénération. `.textContent()` attend indéfiniment (jusqu'au timeout
global du test) qu'un élément absent apparaisse ; le `.catch()` que j'avais
ajouté ne s'applique qu'au rejet, pas à cette attente.

**Conclusion : pas une anomalie applicative.** C'est un bug de mon propre
script exploratoire temporaire (timeout non borné sur une assertion),
corrigé pendant le triage, pas dans le produit. Consigné ici uniquement
pour la traçabilité de la campagne — aucune action de suivi nécessaire.

## Ce qui n'a pas été exploré dans cette passe (portée assumée)

Faute de temps dans une seule campagne, n'ont pas été testés : navigation
clavier complète (tabulation à travers tout le formulaire de situation),
comportement sous limitation de bande passante réelle (throttling réseau, pas
seulement coupure totale), résultats RIASEC avec un instrument modifié en
cours de session (changement de version), et comportement multi-onglets une
fois un compte créé (déjà couvert côté invité par resilience.spec.ts, pas
côté connecté). À couvrir dans une campagne ultérieure si jugé prioritaire.
