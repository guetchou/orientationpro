
interface EntrepreneurialQuestion {
  id: number;
  category: string;
  question: string;
  options: {
    value: number;
    text: string;
  }[];
}

export const entrepreneurialQuestions: EntrepreneurialQuestion[] = [
  {
    id: 1,
    category: "Prise de risque",
    question: "Comment réagissez-vous face à l'incertitude financière?",
    options: [
      { value: 1, text: "Je l'évite à tout prix, je préfère la stabilité" },
      { value: 2, text: "Je la tolère si elle est limitée et bien encadrée" },
      { value: 3, text: "Je peux l'accepter si les bénéfices potentiels sont importants" },
      { value: 4, text: "Je vois l'incertitude comme une opportunité à saisir" }
    ]
  },
  {
    id: 2,
    category: "Autonomie",
    question: "Comment vous sentez-vous à l'idée de prendre des décisions importantes seul(e)?",
    options: [
      { value: 1, text: "Je préfère éviter cette responsabilité" },
      { value: 2, text: "Je peux le faire mais je préfère avoir des avis" },
      { value: 3, text: "Je suis à l'aise avec cela la plupart du temps" },
      { value: 4, text: "Je préfère être celui/celle qui prend les décisions finales" }
    ]
  },
  {
    id: 3,
    category: "Innovation",
    question: "Comment réagissez-vous face aux idées nouvelles?",
    options: [
      { value: 1, text: "Je préfère les méthodes éprouvées et traditionnelles" },
      { value: 2, text: "J'accepte les nouvelles idées si elles ont fait leurs preuves ailleurs" },
      { value: 3, text: "Je suis ouvert(e) à essayer de nouvelles approches" },
      { value: 4, text: "Je cherche constamment à innover et à expérimenter" }
    ]
  },
  {
    id: 4,
    category: "Persévérance",
    question: "Face à un échec important, quelle est votre réaction?",
    options: [
      { value: 1, text: "Je préfère abandonner et passer à autre chose" },
      { value: 2, text: "Je continue si j'ai du soutien extérieur" },
      { value: 3, text: "Je persévère généralement malgré les difficultés" },
      { value: 4, text: "Les échecs me motivent à redoubler d'efforts" }
    ]
  },
  {
    id: 5,
    category: "Leadership",
    question: "Comment vous comportez-vous dans un travail d'équipe?",
    options: [
      { value: 1, text: "Je préfère suivre les directives des autres" },
      { value: 2, text: "Je contribue mais je ne cherche pas à diriger" },
      { value: 3, text: "Je prends souvent l'initiative dans certains domaines" },
      { value: 4, text: "Je me retrouve naturellement en position de leader" }
    ]
  },
  {
    id: 6,
    category: "Indépendance",
    question: "Que pensez-vous de l'idée d'avoir un supérieur hiérarchique?",
    options: [
      { value: 1, text: "Je préfère avoir une structure claire et un manager" },
      { value: 2, text: "J'apprécie avoir un guide mais avec une certaine autonomie" },
      { value: 3, text: "Je peux travailler sous supervision mais je préfère l'autonomie" },
      { value: 4, text: "Je préfère être mon propre patron" }
    ]
  },
  {
    id: 7,
    category: "Vision commerciale",
    question: "Comment percevez-vous les opportunités commerciales?",
    options: [
      { value: 1, text: "Je ne les remarque pas souvent" },
      { value: 2, text: "Je les vois si elles sont évidentes" },
      { value: 3, text: "Je repère régulièrement des opportunités intéressantes" },
      { value: 4, text: "Je vois des opportunités partout, même où les autres n'en voient pas" }
    ]
  },
  {
    id: 8,
    category: "Mobilité",
    question: "Que pensez-vous de l'idée de vous installer dans un autre pays?",
    options: [
      { value: 1, text: "Je préfère rester dans mon environnement actuel" },
      { value: 2, text: "Je pourrais envisager un déménagement temporaire" },
      { value: 3, text: "Je suis ouvert(e) à l'idée de vivre ailleurs si les conditions sont bonnes" },
      { value: 4, text: "Je rêve de m'installer à l'étranger pour de nouvelles opportunités" }
    ]
  },
  {
    id: 9,
    category: "Ambition",
    question: "Comment décririez-vous vos ambitions professionnelles?",
    options: [
      { value: 1, text: "Je cherche principalement la stabilité et l'équilibre" },
      { value: 2, text: "J'aspire à progresser graduellement dans ma carrière" },
      { value: 3, text: "J'ai des objectifs ambitieux que je poursuis activement" },
      { value: 4, text: "Je vise à créer un impact significatif et à réussir exceptionnellement" }
    ]
  },
  {
    id: 10,
    category: "Expertise technique",
    question: "Comment développez-vous vos compétences professionnelles?",
    options: [
      { value: 1, text: "Je me forme quand c'est nécessaire pour mon poste actuel" },
      { value: 2, text: "J'apprends régulièrement de nouvelles compétences liées à mon domaine" },
      { value: 3, text: "Je cherche constamment à élargir mes compétences dans plusieurs domaines" },
      { value: 4, text: "Je me passionne pour l'apprentissage et la maîtrise technique" }
    ]
  },
  {
    id: 11,
    category: "Gestion du stress",
    question: "Comment gérez-vous les situations de forte pression?",
    options: [
      { value: 1, text: "Je trouve cela très difficile et préfère les éviter" },
      { value: 2, text: "Je peux les gérer mais avec un impact sur mon bien-être" },
      { value: 3, text: "Je reste généralement calme et concentré(e)" },
      { value: 4, text: "Je m'épanouis sous pression et donne le meilleur de moi-même" }
    ]
  },
  {
    id: 12,
    category: "Attitude",
    question: "Quelle est votre attitude face au travail en général?",
    options: [
      { value: 1, text: "Je travaille principalement pour subvenir à mes besoins" },
      { value: 2, text: "J'apprécie avoir un emploi stable et satisfaisant" },
      { value: 3, text: "Je suis motivé(e) par les défis et la reconnaissance" },
      { value: 4, text: "Je suis passionné(e) et prêt(e) à investir tout mon temps pour réussir" }
    ]
  },
  {
    id: 13,
    category: "Créativité",
    question: "Comment abordez-vous la résolution de problèmes?",
    options: [
      { value: 1, text: "Je préfère suivre des procédures établies" },
      { value: 2, text: "J'adapte les solutions existantes au contexte" },
      { value: 3, text: "Je cherche souvent des approches alternatives" },
      { value: 4, text: "Je développe régulièrement des solutions originales et innovantes" }
    ]
  },
  {
    id: 14,
    category: "Gestion financière",
    question: "Comment gérez-vous votre argent personnel?",
    options: [
      { value: 1, text: "Je préfère la sécurité, même avec un rendement faible" },
      { value: 2, text: "J'équilibre entre épargne sécurisée et quelques investissements" },
      { value: 3, text: "Je fais des investissements calculés pour faire fructifier mon capital" },
      { value: 4, text: "Je n'hésite pas à investir substantiellement pour des rendements potentiels élevés" }
    ]
  },
  {
    id: 15,
    category: "Relationnel",
    question: "Comment développez-vous votre réseau professionnel?",
    options: [
      { value: 1, text: "Je maintiens quelques relations professionnelles essentielles" },
      { value: 2, text: "J'entretiens un réseau modeste dans mon domaine" },
      { value: 3, text: "Je cultive activement un large réseau professionnel" },
      { value: 4, text: "Je développe stratégiquement des connexions variées et influentes" }
    ]
  }
];
