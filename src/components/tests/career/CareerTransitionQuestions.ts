
export interface CareerTransitionOption {
  text: string;
  value: number;
}

export interface CareerTransitionQuestion {
  id: number;
  question: string;
  options: CareerTransitionOption[];
}

export const careerTransitionQuestions: CareerTransitionQuestion[] = [
  {
    id: 1,
    question: "Quel est votre niveau de satisfaction dans votre carrière actuelle ?",
    options: [
      { text: "Très insatisfait(e)", value: 10 },
      { text: "Plutôt insatisfait(e)", value: 30 },
      { text: "Neutre", value: 50 },
      { text: "Plutôt satisfait(e)", value: 70 },
      { text: "Très satisfait(e)", value: 90 }
    ]
  },
  {
    id: 2,
    question: "Comment évaluez-vous la transférabilité de vos compétences actuelles vers un nouveau domaine ?",
    options: [
      { text: "Très faible", value: 10 },
      { text: "Faible", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  },
  {
    id: 3,
    question: "Quel est votre niveau d'adaptabilité au changement ?",
    options: [
      { text: "Je résiste fortement au changement", value: 10 },
      { text: "Je préfère la stabilité", value: 30 },
      { text: "Je m'adapte progressivement", value: 50 },
      { text: "Je m'adapte bien aux changements", value: 70 },
      { text: "J'accueille positivement les changements", value: 90 }
    ]
  },
  {
    id: 4,
    question: "Quelle est votre tolérance au risque professionnel ?",
    options: [
      { text: "Très faible", value: 10 },
      { text: "Faible", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Élevée", value: 70 },
      { text: "Très élevée", value: 90 }
    ]
  },
  {
    id: 5,
    question: "Comment évaluez-vous votre capacité à apprendre de nouvelles compétences ?",
    options: [
      { text: "Très limitée", value: 10 },
      { text: "Limitée", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  }
];
