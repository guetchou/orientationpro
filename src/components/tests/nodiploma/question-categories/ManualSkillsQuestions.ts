
import { TestQuestion } from "../TestQuestions";

export const manualSkillsQuestions: TestQuestion[] = [
  {
    id: 1,
    question: "Préférez-vous travailler avec vos mains et fabriquer des choses?",
    category: "manual_skills",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  },
  {
    id: 12,
    question: "Êtes-vous intéressé(e) par l'apprentissage de métiers traditionnels ou d'artisanat?",
    category: "traditional_trade_interest",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  },
  {
    id: 5,
    question: "Aimez-vous travailler dehors et dans la nature?",
    category: "outdoor",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  }
];
