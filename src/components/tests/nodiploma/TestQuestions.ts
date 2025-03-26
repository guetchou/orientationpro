
// Define questions for the No Diploma Career Test
export interface TestQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    value: number;
    label: string;
  }[];
}

export const careerTestQuestions: TestQuestion[] = [
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
  },
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
  },
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
  },
  {
    id: 7,
    question: "Êtes-vous prêt(e) à apprendre un métier par l'apprentissage pratique?",
    category: "learning_attitude",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Passionnément" }
    ]
  },
  {
    id: 8,
    question: "Êtes-vous capable de travailler sous pression ou dans des délais serrés?",
    category: "stress_tolerance",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Certainement" }
    ]
  },
  {
    id: 9,
    question: "Préférez-vous un métier avec des horaires réguliers?",
    category: "schedule_preference",
    options: [
      { value: 1, label: "Pas important" },
      { value: 2, label: "Légèrement important" },
      { value: 3, label: "Moyennement important" },
      { value: 4, label: "Très important" },
      { value: 5, label: "Extrêmement important" }
    ]
  },
  {
    id: 10,
    question: "Aimez-vous travailler en équipe?",
    category: "teamwork",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Énormément" }
    ]
  },
  {
    id: 11,
    question: "Avez-vous des compétences en communication orale ou écrite?",
    category: "communication_skills",
    options: [
      { value: 1, label: "Très faibles" },
      { value: 2, label: "Faibles" },
      { value: 3, label: "Moyennes" },
      { value: 4, label: "Bonnes" },
      { value: 5, label: "Excellentes" }
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
    id: 13,
    question: "Êtes-vous prêt(e) à avoir des responsabilités et prendre des décisions?",
    category: "responsibility",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Complètement" }
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
  },
  {
    id: 15,
    question: "Aimez-vous organiser, planifier et structurer votre travail?",
    category: "organization",
    options: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Un peu" },
      { value: 3, label: "Moyennement" },
      { value: 4, label: "Beaucoup" },
      { value: 5, label: "Absolument" }
    ]
  }
];

export interface NoDiplomaCareerResults {
  manual_skills?: number;
  service_orientation?: number;
  sales_aptitude?: number;
  creativity?: number;
  outdoor?: number;
  tech_aptitude?: number;
  learning_attitude?: number;
  stress_tolerance?: number;
  schedule_preference?: number;
  teamwork?: number;
  communication_skills?: number;
  traditional_trade_interest?: number;
  responsibility?: number;
  customer_service?: number;
  organization?: number;
  recommended_jobs?: string[];
  career_paths?: string[];
  strengths?: string[];
  challenges?: string[];
  training_recommendations?: string[];
  recommendedFields?: string[];
  recommendedPaths?: string[];
  entrepreneurialAptitude?: number;
  selfLearningCapacity?: number;
  practicalSkills?: number;
  socialIntelligence?: number;
  resilience?: number;
  experiencePortfolio?: number;
  careerPotential?: number;
  entrepreneurialSpirit?: number;
  tradeInterest?: number;
  confidenceScore?: number;
  aiInsights?: {
    careerPath?: string;
    potential?: number;
    summary?: string;
    recommendations?: string[];
  };
}
