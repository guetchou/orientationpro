
import { TestQuestion } from "../TestQuestions";

export const technologyQuestions: TestQuestion[] = [
  {
    id: 6,
    question: "Êtes-vous à l'aise avec les outils informatiques et la technologie?",
    category: "tech_aptitude",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  }
];
