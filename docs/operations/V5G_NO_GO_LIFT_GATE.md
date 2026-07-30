# V5-G — gate de levée du NO-GO

Statut initial : **NO-GO**. Les flags Vague 5 restent désactivés par défaut.

## Critères

- preuve navigateur authentifiée complète sur un SHA unique ;
- charge authentifiée en lecture/écriture avec MySQL, percentiles, erreurs,
  saturation et isolation entre comptes ;
- matrice de dépendances sans décision implicite et acceptation formelle des
  risques résiduels par le responsable habilité ;
- trois suites manuelles : Safari/VoiceOver, Windows/NVDA, clavier et zoom réel ;
- sauvegarde, restauration et rollback toujours couverts par les preuves V5
  rattachées au même candidat intégré.

## Décision

- `GO` : tous les critères passent et le mainteneur donne un feu vert distinct.
- `GO LIMITÉ` : le mainteneur nomme SHA, flags, cohorte, durée, seuils d’arrêt,
  propriétaire, rollback et acceptations de risque.
- `NO-GO` : tout autre état, avec bloqueurs nommés.

À la création de ce lot, Safari/VoiceOver et NVDA ne sont pas exécutables sur
l’hôte Linux. Leur absence est un bloqueur documenté, jamais remplacé par une
émulation ou une capture d’écran.
