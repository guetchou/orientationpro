
import { Brain, BookOpen, Heart, Lightbulb, ArrowRight, CheckCircle, LineChart } from "lucide-react";

export interface TestType {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  duration: string;
  questions: number;
  benefits: string[];
  path: string;
  color: string;
}

export const testsData: TestType[] = [
  {
    id: "riasec",
    title: "Test RIASEC",
    description: "Découvrez vos intérêts professionnels et les métiers qui vous correspondent",
    icon: <Brain className="w-10 h-10 text-primary" />,
    duration: "15-20 min",
    questions: 60,
    benefits: [
      "Identifiez vos centres d'intérêt professionnels",
      "Découvrez les métiers adaptés à votre profil",
      "Obtenez des recommandations de formations"
    ],
    path: "/tests/riasec",
    color: "bg-gradient-to-br from-primary-100 to-primary-50"
  },
  {
    id: "emotional",
    title: "Test d'Intelligence Émotionnelle",
    description: "Évaluez votre capacité à comprendre et gérer vos émotions",
    icon: <Heart className="w-10 h-10 text-pink-500" />,
    duration: "10-15 min",
    questions: 45,
    benefits: [
      "Évaluez votre quotient émotionnel",
      "Identifiez vos forces et faiblesses émotionnelles",
      "Recevez des conseils pour développer votre intelligence émotionnelle"
    ],
    path: "/tests/emotional",
    color: "bg-gradient-to-br from-pink-100 to-pink-50"
  },
  {
    id: "multiple",
    title: "Test des Intelligences Multiples",
    description: "Identifiez vos types d'intelligence dominants selon la théorie de Gardner",
    icon: <Brain className="w-10 h-10 text-purple-500" />,
    duration: "15 min",
    questions: 40,
    benefits: [
      "Découvrez vos intelligences dominantes",
      "Comprenez comment vous apprenez le mieux",
      "Identifiez les domaines professionnels adaptés à votre profil"
    ],
    path: "/tests/multiple",
    color: "bg-gradient-to-br from-purple-100 to-purple-50"
  },
  {
    id: "learning",
    title: "Test de Style d'Apprentissage",
    description: "Découvrez votre façon préférée d'apprendre et de traiter l'information",
    icon: <Lightbulb className="w-10 h-10 text-secondary" />,
    duration: "10 min",
    questions: 30,
    benefits: [
      "Identifiez votre style d'apprentissage dominant",
      "Recevez des conseils adaptés à votre façon d'apprendre",
      "Optimisez vos méthodes d'études et de travail"
    ],
    path: "/tests/learning",
    color: "bg-gradient-to-br from-secondary-100 to-secondary-50"
  },
  {
    id: "entrepreneurial",
    title: "Test d'Aptitude Entrepreneuriale",
    description: "Découvrez si vous avez l'étoffe d'un entrepreneur ou d'un salarié",
    icon: <LineChart className="w-10 h-10 text-amber-500" />,
    duration: "10-12 min",
    questions: 15,
    benefits: [
      "Identifiez votre profil professionnel idéal",
      "Découvrez si vous êtes fait pour entreprendre",
      "Obtenez des recommandations adaptées à votre profil"
    ],
    path: "/tests/entrepreneurial",
    color: "bg-gradient-to-br from-amber-100 to-amber-50"
  }
];
