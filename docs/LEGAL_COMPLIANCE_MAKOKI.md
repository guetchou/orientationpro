# MAKOKI — Registre de conformité avant ouverture publique

Statut : document opérationnel interne. Il ne remplace pas une revue juridique formelle.

## 1. Identité de l’éditeur

Informations confirmées :

- raison sociale déclarée : Nexora ;
- marque : MAKOKI ;
- ville et pays : Brazzaville, République du Congo ;
- représentant déclaré : NGUIE Gess ;
- e-mail général : contact@makoki.org ;
- support : support@makoki.org ;
- données personnelles : rgpd@makoki.org ;
- téléphone et WhatsApp : +242 05 534 42 53 ;
- plage horaire annoncée : 08h00–20h00.

Informations bloquantes à confirmer :

- forme juridique exacte figurant sur le RCCM ;
- adresse complète de l’établissement ;
- numéro RCCM ;
- numéro NIU ;
- intitulé juridique exact de la fonction de NGUIE Gess ;
- jours d’ouverture du support.

## 2. Hébergement et domaine

- application : VPS OVHcloud administré directement par Nexora ;
- nom de domaine : enregistré auprès de Spaceship, Inc. ;
- ne pas présenter Spaceship comme hébergeur de l’application ;
- confirmer si Spaceship fournit également la messagerie `@makoki.org`.

## 3. Autorité et formalités congolaises

Avant l’exploitation générale des traitements personnels :

- constituer le registre des traitements ;
- identifier les traitements soumis à déclaration ou autorisation ;
- préparer les dossiers destinés à la Commission nationale pour la protection des données à caractère personnel ;
- documenter les transferts internationaux vers les prestataires situés hors du Congo ;
- obtenir les autorisations requises avant tout transfert lorsque le niveau de protection ou la nature du traitement l’impose ;
- conserver les récépissés, décisions et preuves de conformité.

## 4. Mineurs

Politique retenue :

- inscription actuelle : 16 ans minimum ;
- objectif produit : ouverture possible à partir de 14 ans ;
- pour les 14–15 ans : consentement conjoint et vérifiable du mineur et du titulaire de l’autorité parentale ;
- tant que le workflow parental n’est pas construit côté serveur, aucune inscription 14–15 ans ne doit être acceptée.

Travaux nécessaires :

- collecter la date de naissance avec minimisation ;
- créer une invitation parentale à usage unique ;
- vérifier l’adresse du parent ou responsable ;
- conserver la preuve horodatée des deux consentements et la version des textes acceptés ;
- permettre le retrait du consentement ;
- définir la procédure en cas de majorité atteinte ou de changement du responsable parental ;
- interdire le contournement par une simple case déclarative.

## 5. Conservation retenue

| Catégorie | Durée opérationnelle |
|---|---|
| Compte | 24 mois d’inactivité |
| Résultat d’orientation | 24 mois après dernière activité liée |
| Réponses détaillées | 12 mois après le résultat |
| CV et documents | 24 mois après dernière utilisation |
| Candidature | 24 mois après clôture ou dernier échange |
| Rendez-vous | 24 mois après la date ou l’annulation |
| Logs techniques et sécurité | 12 mois hors incident ou gel probatoire |
| Support | 24 mois après clôture |
| Preuves de consentement | 5 ans après retrait ou fin de relation |
| Pièces comptables | 10 ans lorsque l’obligation s’applique |
| Suppression active après fermeture | cible de 30 jours |
| Sauvegardes après fermeture | purge au plus tard sous 90 jours |

À implémenter :

- tâches automatiques de purge ;
- préavis avant suppression pour inactivité ;
- journal des suppressions sans conserver le contenu supprimé ;
- procédure de gel en cas de litige ou incident ;
- test de restauration confirmant la purge des sauvegardes à échéance.

## 6. Prestataires et sous-traitants

À documenter dans un registre :

- OVHcloud ;
- Spaceship ;
- fournisseur SMTP exact ;
- Google Authentication ;
- Google Analytics ;
- Meta Pixel ;
- Chatwoot et son lieu d’hébergement ;
- opérateurs Mobile Money et passerelles de paiement ;
- éventuels services de stockage, supervision, sauvegarde ou messagerie.

Pour chaque acteur : finalité, données, pays, base juridique, contrat, durée, mesures de sécurité, suppression, sous-traitants ultérieurs et mécanisme de transfert.

## 7. Cookies et traceurs

État du code :

- consentement refusé par défaut ;
- Google Analytics et Meta Pixel non chargés sans accord ;
- choix conservé six mois ;
- bouton permanent « Gérer mes cookies » ;
- analytics local désactivé sans consentement ;
- purge des événements locaux après quatorze mois ;
- Chatwoot classé dans la catégorie support.

Avant activation :

- renseigner les identifiants uniquement dans l’environnement de production ;
- vérifier au navigateur qu’aucune requête Google, Meta ou Chatwoot n’est émise avant consentement ;
- publier la liste exacte des cookies, domaines, durées et destinataires ;
- tester accepter, refuser, personnaliser et retirer le consentement ;
- ne pas activer Meta Pixel sans nécessité commerciale documentée.

## 8. Paiements et services payants

Avant activation :

- identifier les prestataires Mobile Money ;
- afficher le prix en francs CFA, les taxes, la durée et le renouvellement ;
- obtenir un consentement exprès avant tout abonnement renouvelable ;
- envoyer une confirmation et une facture ou reçu ;
- conserver uniquement les références nécessaires, jamais le code secret Mobile Money ;
- documenter les remboursements, rejets, doubles débits et rapprochements ;
- prévoir un canal de contestation accessible.

Politique proposée :

- remboursement intégral après confirmation d’un double débit, paiement non autorisé ou service techniquement non délivré ;
- demande sous sept jours pour un service numérique non activé ou non utilisé ;
- remboursement ou avoir pour rendez-vous annulé plus de 24 heures avant ;
- remboursement intégral si MAKOKI annule ;
- exécution cible sous dix jours ouvrés après approbation.

## 9. Sécurité et droits des personnes

À mettre en place :

- procédure d’accès, rectification, opposition, portabilité et suppression ;
- vérification proportionnée de l’identité du demandeur ;
- export structuré des données ;
- suppression multi-systèmes ;
- registre des demandes et délais ;
- procédure de violation de données ;
- restrictions d’accès et séparation des rôles ;
- chiffrement en transit et des sauvegardes sensibles ;
- tests d’isolation entre comptes ;
- aucune décision significative fondée uniquement sur un profil automatisé.

## 10. Conditions de GO juridique

La vitrine peut rester en pilote, mais l’ouverture générale des comptes, traceurs, paiements et fonctions de recrutement exige au minimum :

1. RCCM, NIU, adresse et fonction exacte publiés ;
2. validation de la forme juridique ;
3. registre des traitements terminé ;
4. formalités auprès de la Commission effectuées ;
5. transferts internationaux documentés ;
6. contrats avec les prestataires disponibles ;
7. suppression automatique et exercice des droits testés ;
8. traceurs testés avant et après consentement ;
9. inscription limitée à 16 ans jusqu’au workflow parental ;
10. politique de paiement validée avec les prestataires réels ;
11. revue finale par un conseil juridique connaissant le droit congolais et l’OHADA.
