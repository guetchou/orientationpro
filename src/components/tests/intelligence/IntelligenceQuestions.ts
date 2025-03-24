
export interface IntelligenceQuestion {
  id: number;
  question: string;
  options: string[];
}

export const intelligenceQuestions: IntelligenceQuestion[] = [
  {
    id: 1,
    question: "Comment préférez-vous apprendre de nouvelles choses ?",
    options: [
      "En lisant et en écrivant",
      "En écoutant des explications",
      "En manipulant des objets",
      "En observant des schémas et des images"
    ]
  },
  {
    id: 2,
    question: "Quelle activité vous attire le plus ?",
    options: [
      "Résoudre des énigmes mathématiques",
      "Jouer d'un instrument de musique",
      "Faire du sport",
      "Dessiner ou peindre"
    ]
  },
  {
    id: 3,
    question: "Comment organisez-vous vos idées ?",
    options: [
      "En faisant des listes",
      "En créant des cartes mentales",
      "En discutant avec d'autres",
      "En faisant des croquis"
    ]
  }
];
