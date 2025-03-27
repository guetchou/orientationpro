
import { TestQuestion } from "../TestQuestions";

export const serviceOrientationQuestions: TestQuestion[] = [
  {
    id: 2,
    question: "Aimez-vous aider et prendre soin des autres personnes?",
    category: "service_orientation",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  },
  {
    id: 14,
    question: "Êtes-vous intéressé(e) par le service client et l'assistance aux clients?",
    category: "customer_service",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Énormément" }
    ]
  }
];
