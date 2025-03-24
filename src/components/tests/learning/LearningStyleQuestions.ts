
export interface LearningStyleOption {
  text: string;
  value: number;
}

export interface LearningStyleQuestion {
  id: number;
  question: string;
  options: LearningStyleOption[];
}

export const learningStyleQuestions: LearningStyleQuestion[] = [
  {
    id: 1,
    question: "Quand j'apprends quelque chose de nouveau, je préfère :",
    options: [
      { text: "Voir des diagrammes ou des illustrations", value: 4 },
      { text: "Écouter une explication", value: 3 },
      { text: "Faire des exercices pratiques", value: 5 },
      { text: "Lire des instructions écrites", value: 2 }
    ]
  },
  {
    id: 2,
    question: "Pour me souvenir d'une information, je préfère :",
    options: [
      { text: "Visualiser une image mentale", value: 4 },
      { text: "Répéter l'information à voix haute", value: 3 },
      { text: "Écrire ou gribouiller des notes", value: 2 },
      { text: "Manipuler des objets liés à l'information", value: 5 }
    ]
  },
  {
    id: 3,
    question: "En général, je comprends mieux quand :",
    options: [
      { text: "Je vois comment les choses fonctionnent", value: 4 },
      { text: "Quelqu'un m'explique les choses", value: 3 },
      { text: "Je peux expérimenter par moi-même", value: 5 },
      { text: "Je lis des informations détaillées", value: 2 }
    ]
  }
];
