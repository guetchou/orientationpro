'use strict';

// Référentiel de compétences extensible et multilingue (fr/en), adapté au
// Congo. Chaque compétence a une forme canonique et des alias. Aucun domaine
// n'est privilégié : l'informatique côtoie l'administration, la santé, le BTP,
// le commerce, etc. Les alias sont recherchés par frontière de mot.
const DOMAINS = [
  { domain: 'administration', skills: [
    { canonical: 'gestion administrative', aliases: ['administration', 'gestion administrative', 'secretariat', 'secrétariat'] },
    { canonical: 'archivage', aliases: ['archivage', 'classement', 'gestion documentaire'] },
    { canonical: 'planification', aliases: ['planification', 'planning', 'organisation'] },
  ]},
  { domain: 'comptabilite-finance', skills: [
    { canonical: 'comptabilité', aliases: ['comptabilite', 'comptabilité', 'accounting', 'comptable'] },
    { canonical: 'analyse financière', aliases: ['analyse financiere', 'analyse financière', 'financial analysis'] },
    { canonical: 'SYSCOHADA', aliases: ['syscohada', 'ohada'] },
    { canonical: 'fiscalité', aliases: ['fiscalite', 'fiscalité', 'tax', 'impots', 'impôts'] },
    { canonical: 'paie', aliases: ['paie', 'payroll', 'bulletin de paie'] },
  ]},
  { domain: 'banque-assurance', skills: [
    { canonical: 'gestion de portefeuille', aliases: ['portefeuille', 'portfolio'] },
    { canonical: 'analyse de crédit', aliases: ['analyse de credit', 'analyse de crédit', 'credit analysis', 'risque credit'] },
    { canonical: 'assurance', aliases: ['assurance', 'insurance', 'sinistre'] },
  ]},
  { domain: 'sante', skills: [
    { canonical: 'soins infirmiers', aliases: ['soins infirmiers', 'nursing', 'infirmier', 'infirmière'] },
    { canonical: 'santé publique', aliases: ['sante publique', 'santé publique', 'public health'] },
    { canonical: 'pharmacie', aliases: ['pharmacie', 'pharmacy', 'dispensation'] },
  ]},
  { domain: 'education', skills: [
    { canonical: 'enseignement', aliases: ['enseignement', 'teaching', 'pedagogie', 'pédagogie', 'formation'] },
    { canonical: 'gestion de classe', aliases: ['gestion de classe', 'classroom management'] },
  ]},
  { domain: 'telecom-informatique', skills: [
    { canonical: 'réseaux', aliases: ['reseaux', 'réseaux', 'networking', 'tcp/ip'] },
    { canonical: 'support informatique', aliases: ['support informatique', 'helpdesk', 'support technique', 'it support'] },
    { canonical: 'développement logiciel', aliases: ['developpement', 'développement', 'programmation', 'software'] },
    { canonical: 'bases de données', aliases: ['base de donnees', 'bases de données', 'sql', 'mysql', 'database'] },
    { canonical: 'bureautique', aliases: ['bureautique', 'word', 'excel', 'powerpoint', 'office'] },
  ]},
  { domain: 'commerce-vente', skills: [
    { canonical: 'vente', aliases: ['vente', 'sales', 'commercial', 'prospection'] },
    { canonical: 'négociation', aliases: ['negociation', 'négociation', 'negotiation'] },
    { canonical: 'relation client', aliases: ['relation client', 'customer relationship', 'fidelisation', 'fidélisation'] },
  ]},
  { domain: 'logistique-transport', skills: [
    { canonical: 'gestion de stock', aliases: ['gestion de stock', 'inventory', 'stock', 'approvisionnement'] },
    { canonical: 'logistique', aliases: ['logistique', 'logistics', 'supply chain', 'chaine logistique'] },
    { canonical: 'transport', aliases: ['transport', 'transit', 'douane'] },
  ]},
  { domain: 'btp-energie', skills: [
    { canonical: 'génie civil', aliases: ['genie civil', 'génie civil', 'civil engineering', 'chantier'] },
    { canonical: 'électricité', aliases: ['electricite', 'électricité', 'electrical', 'electricien'] },
    { canonical: 'HSE', aliases: ['hse', 'securite', 'sécurité', 'qhse', 'safety'] },
    { canonical: 'pétrole et gaz', aliases: ['petrole', 'pétrole', 'gaz', 'oil and gas', 'forage'] },
  ]},
  { domain: 'agriculture', skills: [
    { canonical: 'agronomie', aliases: ['agronomie', 'agriculture', 'agronomy', 'elevage', 'élevage'] },
  ]},
  { domain: 'hotellerie-restauration', skills: [
    { canonical: 'restauration', aliases: ['restauration', 'cuisine', 'catering', 'service en salle'] },
    { canonical: 'hôtellerie', aliases: ['hotellerie', 'hôtellerie', 'hospitality', 'reception', 'réception'] },
  ]},
  { domain: 'droit-rh', skills: [
    { canonical: 'droit', aliases: ['droit', 'juridique', 'legal', 'contentieux'] },
    { canonical: 'ressources humaines', aliases: ['ressources humaines', 'rh', 'human resources', 'recrutement'] },
  ]},
  { domain: 'communication-relation-client', skills: [
    { canonical: 'communication', aliases: ['communication', 'marketing', 'community management'] },
    { canonical: 'centre d’appels', aliases: ['centre d\'appels', 'call center', 'teleconseiller', 'téléconseiller'] },
    { canonical: 'service client', aliases: ['service client', 'customer service', 'support client'] },
  ]},
  { domain: 'entrepreneuriat', skills: [
    { canonical: 'gestion de projet', aliases: ['gestion de projet', 'project management', 'chef de projet'] },
    { canonical: 'entrepreneuriat', aliases: ['entrepreneuriat', 'entrepreneurship', 'creation d\'entreprise'] },
  ]},
];

const ACTION_VERBS = [
  'gérer', 'gerer', 'gere', 'diriger', 'coordonner', 'développer', 'developper', 'concevoir',
  'mettre en place', 'analyser', 'négocier', 'negocier', 'former', 'encadrer', 'superviser',
  'organiser', 'optimiser', 'réaliser', 'realiser', 'assurer', 'piloter', 'vendre', 'conseiller',
  'manage', 'lead', 'develop', 'design', 'implement', 'coordinate', 'improve', 'deliver',
];

module.exports = { DOMAINS, ACTION_VERBS };
