
export interface EmotionalOption {
  text: string;
  value: number;
}

export interface EmotionalQuestion {
  id: number;
  question: string;
  options: EmotionalOption[];
}

export const emotionalQuestions: EmotionalQuestion[] = [
  {
    id: 1,
    question: "Comment réagissez-vous face à une situation stressante ?",
    options: [
      { text: "Je reste calme et analyse la situation", value: 5 },
      { text: "Je deviens anxieux(se) mais je gère", value: 3 },
      { text: "Je perds facilement mon sang-froid", value: 1 },
      { text: "Je cherche de l'aide auprès des autres", value: 4 }
    ]
  },
  {
    id: 2,
    question: "Comment gérez-vous vos émotions au travail/à l'école ?",
    options: [
      { text: "Je les exprime de manière constructive", value: 5 },
      { text: "Je les garde pour moi", value: 2 },
      { text: "Je les partage avec mes collègues/camarades", value: 4 },
      { text: "J'ai du mal à les contrôler", value: 1 }
    ]
  },
  {
    id: 3,
    question: "Comment percevez-vous les émotions des autres ?",
    options: [
      { text: "Je suis très empathique", value: 5 },
      { text: "J'ai parfois du mal à les comprendre", value: 2 },
      { text: "Je suis attentif(ve) mais objectif(ve)", value: 4 },
      { text: "Je préfère rester distant(e)", value: 1 }
    ]
  }
];
