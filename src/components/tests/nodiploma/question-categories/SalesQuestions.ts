
import { TestQuestion } from "../TestQuestions";

export const salesQuestions: TestQuestion[] = [
  {
    id: 3,
    question: "Êtes-vous intéressé(e) par la vente et la négociation?",
    category: "sales_aptitude",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  }
];
