
import { TestQuestion } from "../TestQuestions";

export const creativityQuestions: TestQuestion[] = [
  {
    id: 4,
    question: "Êtes-vous créatif(ve) et aimez-vous l'art?",
    category: "creativity",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  }
];
