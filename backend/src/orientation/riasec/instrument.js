const INSTRUMENT_ID = 'riasec-makoki-fr-draft-v2';
const INSTRUMENT_VERSION = 2;

const dimensions = Object.freeze({
  R: {
    code: 'R',
    name: 'Réaliste',
    summary: 'Intérêt pour les activités concrètes, techniques, physiques et orientées vers des résultats observables.',
  },
  I: {
    code: 'I',
    name: 'Investigateur',
    summary: 'Intérêt pour l’analyse, la recherche, la compréhension et la résolution méthodique de problèmes.',
  },
  A: {
    code: 'A',
    name: 'Artistique',
    summary: 'Intérêt pour la création, l’expression, l’imagination et les environnements laissant une marge d’originalité.',
  },
  S: {
    code: 'S',
    name: 'Social',
    summary: 'Intérêt pour l’aide, l’apprentissage, l’accompagnement et les activités centrées sur les personnes.',
  },
  E: {
    code: 'E',
    name: 'Entreprenant',
    summary: 'Intérêt pour l’initiative, la persuasion, la négociation, la décision et la conduite d’objectifs.',
  },
  C: {
    code: 'C',
    name: 'Conventionnel',
    summary: 'Intérêt pour l’organisation, la précision, les procédures, les données et les environnements structurés.',
  },
});

const prompts = {
  R: [
    ['Je prends plaisir à fabriquer, monter ou réparer un objet.', false],
    ['J’aime installer ou régler un équipement pour qu’il fonctionne correctement.', false],
    ['Je préfère certaines activités qui se déroulent sur le terrain plutôt que seulement derrière un bureau.', false],
    ['L’utilisation d’outils ou de matériel technique m’intéresse.', false],
    ['J’aime rechercher la cause pratique d’une panne mécanique ou électrique.', false],
    ['Je suis motivé par les tâches dont le résultat concret est rapidement visible.', false],
    ['Conduire ou manipuler un équipement en respectant des consignes m’attire.', false],
    ['Contrôler physiquement la qualité d’un produit ou d’une installation peut me plaire.', false],
    ['Je préfère éviter les activités qui demandent de manipuler du matériel ou des équipements.', true],
    ['Les tâches manuelles et techniques m’intéressent peu.', true],
  ],
  I: [
    ['J’aime rechercher des informations avant de tirer une conclusion.', false],
    ['Analyser des données pour comprendre une situation m’intéresse.', false],
    ['Je prends plaisir à diagnostiquer la cause d’un problème complexe.', false],
    ['Tester une hypothèse ou comparer plusieurs explications me motive.', false],
    ['Je cherche volontiers à comprendre comment un système fonctionne en profondeur.', false],
    ['Les problèmes logiques ou scientifiques retiennent facilement mon attention.', false],
    ['Je vérifie les preuves et les sources avant d’accepter une affirmation.', false],
    ['Apprendre de nouvelles notions techniques ou scientifiques me stimule.', false],
    ['Je préfère éviter les questions qui demandent une analyse approfondie.', true],
    ['Je suis plus à l’aise avec une réponse immédiate qu’avec une longue recherche.', true],
  ],
  A: [
    ['Créer un texte, une image, un objet ou un contenu original me plaît.', false],
    ['J’aime imaginer plusieurs solutions inhabituelles à un même problème.', false],
    ['Exprimer une idée par le design, la musique, l’écriture ou la scène m’intéresse.', false],
    ['Je remarque facilement la présentation, les formes, les sons ou l’esthétique.', false],
    ['Je préfère les activités qui laissent une place à l’imagination.', false],
    ['Concevoir une identité visuelle ou une manière nouvelle de communiquer peut me motiver.', false],
    ['Raconter une histoire ou transmettre une émotion par un contenu me plaît.', false],
    ['Améliorer l’apparence ou l’originalité d’un projet m’intéresse.', false],
    ['Je préfère les tâches où aucune créativité personnelle n’est attendue.', true],
    ['Les activités artistiques ou créatives m’attirent peu.', true],
  ],
  S: [
    ['Aider une personne à résoudre une difficulté me donne de l’énergie.', false],
    ['Expliquer une notion jusqu’à ce qu’elle soit comprise me plaît.', false],
    ['J’écoute volontiers une personne qui cherche un conseil.', false],
    ['Faciliter l’entente entre plusieurs personnes m’intéresse.', false],
    ['Participer à une activité éducative, sanitaire ou communautaire peut me motiver.', false],
    ['Je suis à l’aise lorsque mon travail consiste à accompagner une progression.', false],
    ['Travailler avec un groupe pour répondre à un besoin humain me plaît.', false],
    ['Je prends plaisir à transmettre une méthode ou une compétence.', false],
    ['Je préfère que mon travail implique le moins possible de contacts avec d’autres personnes.', true],
    ['Les activités d’aide ou d’accompagnement me motivent peu.', true],
  ],
  E: [
    ['Présenter une idée pour obtenir l’adhésion des autres m’intéresse.', false],
    ['Prendre l’initiative lorsqu’un projet doit avancer me plaît.', false],
    ['Coordonner une équipe vers un objectif peut me motiver.', false],
    ['Négocier un accord ou défendre une proposition m’intéresse.', false],
    ['Je suis prêt à prendre une décision lorsque plusieurs options sont possibles.', false],
    ['Développer une activité commerciale ou entrepreneuriale m’attire.', false],
    ['Mobiliser des personnes et des ressources autour d’un projet me plaît.', false],
    ['Atteindre un objectif mesurable et assumer le résultat me stimule.', false],
    ['Je préfère éviter les rôles où je dois prendre des responsabilités importantes.', true],
    ['Défendre une idée ou convaincre un interlocuteur me met généralement mal à l’aise.', true],
  ],
  C: [
    ['Classer des informations de manière claire et facile à retrouver me plaît.', false],
    ['Suivre une procédure précise pour éviter les erreurs me convient.', false],
    ['Vérifier les détails d’un document, d’un chiffre ou d’un dossier m’intéresse.', false],
    ['Planifier les étapes d’une activité et respecter les délais me motive.', false],
    ['Travailler avec des tableaux, des budgets ou des données administratives peut me plaire.', false],
    ['J’apprécie les outils qui permettent de suivre méthodiquement l’avancement d’un travail.', false],
    ['Contrôler l’exactitude et la conformité d’une opération m’intéresse.', false],
    ['Un environnement organisé avec des responsabilités bien définies me convient.', false],
    ['La documentation et le classement des informations me dérangent.', true],
    ['Je préfère improviser plutôt que travailler avec un plan ou une méthode établie.', true],
  ],
};

const items = [];
for (let round = 0; round < 10; round += 1) {
  for (const dimension of ['R', 'I', 'A', 'S', 'E', 'C']) {
    const [prompt, reverseScored] = prompts[dimension][round];
    items.push(Object.freeze({
      id: `${INSTRUMENT_ID}-${dimension.toLowerCase()}-${String(round + 1).padStart(2, '0')}`,
      position: items.length + 1,
      dimension,
      prompt,
      reverseScored,
    }));
  }
}

const instrument = Object.freeze({
  id: INSTRUMENT_ID,
  version: INSTRUMENT_VERSION,
  slug: 'riasec',
  locale: 'fr',
  status: 'draft',
  title: 'Exploration des intérêts professionnels RIASEC',
  responseScale: Object.freeze([
    Object.freeze({ value: 1, label: 'Pas du tout d’accord' }),
    Object.freeze({ value: 2, label: 'Plutôt pas d’accord' }),
    Object.freeze({ value: 3, label: 'Ni d’accord ni pas d’accord' }),
    Object.freeze({ value: 4, label: 'Plutôt d’accord' }),
    Object.freeze({ value: 5, label: 'Tout à fait d’accord' }),
  ]),
  methodology: 'Somme des réponses par dimension après inversion des items concernés, transformation linéaire descriptive de 0 à 100, puis classement par groupes d’égalité. Aucun percentile ni indice de confiance n’est calculé sans population normative documentée.',
  source: {
    kind: 'original-draft',
    reference: 'Banque originale MAKOKI rédigée en français. Elle n’est pas dérivée des items de l’outil O*NET Interest Profiler. Gouvernance et provenance : docs/riasec/INSTRUMENT_PROVENANCE.md.',
    license: 'Statut de diffusion non ouvert : usage interne au projet MAKOKI jusqu’à décision explicite du titulaire. Aucune licence O*NET ne s’applique à ces items originaux.',
  },
  disclaimer: 'Cet outil sert à explorer des intérêts professionnels. Il ne constitue ni un diagnostic psychologique, ni une mesure d’aptitude, ni une garantie de réussite. Cette banque MAKOKI est en statut draft et n’est pas présentée comme psychométriquement validée.',
  dimensions,
  items: Object.freeze(items),
});

module.exports = {
  INSTRUMENT_ID,
  INSTRUMENT_VERSION,
  instrument,
};
