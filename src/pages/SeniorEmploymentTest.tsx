
import { useTestState } from "@/hooks/useTestState";
import TestLayout from "@/components/tests/TestLayout";
import { TestQuestion } from "@/components/tests/TestQuestion";
import { SeniorEmploymentResults } from "@/types/test";

export default function SeniorEmploymentTest() {
  // Define questions
  const seniorEmploymentQuestions = [
    {
      id: 1,
      question: "Comment évaluez-vous la valeur de votre expérience professionnelle ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyenne", value: 50 },
        { text: "Bonne", value: 70 },
        { text: "Excellente", value: 90 }
      ]
    },
    {
      id: 2,
      question: "Comment vous adaptez-vous aux nouvelles technologies ?",
      options: [
        { text: "Très difficilement", value: 10 },
        { text: "Difficilement", value: 30 },
        { text: "Moyennement", value: 50 },
        { text: "Bien", value: 70 },
        { text: "Très bien", value: 90 }
      ]
    },
    {
      id: 3,
      question: "Quelle importance accordez-vous à l'équilibre vie privée-vie professionnelle ?",
      options: [
        { text: "Aucune importance", value: 10 },
        { text: "Peu d'importance", value: 30 },
        { text: "Importance moyenne", value: 50 },
        { text: "Importance", value: 70 },
        { text: "Très grande importance", value: 90 }
      ]
    },
    {
      id: 4,
      question: "Quel est votre potentiel de mentorat pour les jeunes générations ?",
      options: [
        { text: "Très faible", value: 10 },
        { text: "Faible", value: 30 },
        { text: "Moyen", value: 50 },
        { text: "Bon", value: 70 },
        { text: "Excellent", value: 90 }
      ]
    }
  ];
  
  // Define analyze function
  const analyzeSeniorEmploymentResults = (responses: number[]): SeniorEmploymentResults => {
    // Calcul des scores pour chaque dimension
    const experienceValue = responses[0] || 50;
    const technologyAdaptation = responses[1] || 50;
    const workLifeBalance = responses[2] || 50;
    const mentorshipPotential = responses[3] || 50;

    // Recommandations de rôles basées sur les réponses
    const recommendedRoles = [];
    if (experienceValue > 70 && mentorshipPotential > 70) {
      recommendedRoles.push("Consultant", "Mentor", "Formateur");
    } else if (technologyAdaptation > 70) {
      recommendedRoles.push("Conseiller technique", "Spécialiste IT", "Support technique");
    } else {
      recommendedRoles.push("Gestion de projet", "Administration", "Service à la clientèle");
    }

    // Niveau de confiance basé sur la cohérence des réponses
    const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

    return {
      experienceValue,
      technologyAdaptation,
      workLifeBalance,
      mentorshipPotential,
      recommendedRoles,
      confidenceScore
    };
  };

  const {
    currentQuestion,
    totalQuestions,
    currentQuestionData,
    isSubmitting,
    handleAnswer
  } = useTestState({
    testType: 'senior_employment',
    questions: seniorEmploymentQuestions,
    analyzeResults: analyzeSeniorEmploymentResults
  });

  return (
    <TestLayout
      testName="Test d'Emploi Senior"
      accentColor="amber"
      isSubmitting={isSubmitting}
    >
      <TestQuestion
        question={currentQuestionData.question}
        options={currentQuestionData.options}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        isSubmitting={isSubmitting}
        accentColor="amber"
      />
    </TestLayout>
  );
}
