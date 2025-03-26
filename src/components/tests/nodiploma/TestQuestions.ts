
import { Wrench, Lightbulb, GraduationCap, Network, Users } from "lucide-react";

export interface NoDiplomaCareerQuestion {
  id: number;
  question: string;
  description: string;
  icon: JSX.Element;
  tags: string[];
  options: {
    text: string;
    value: number;
  }[];
}

export const noDiplomaCareerQuestions: NoDiplomaCareerQuestion[] = [
  {
    id: 1,
    question: "Comment évaluez-vous vos compétences pratiques et manuelles ?",
    description: "Votre capacité à créer, réparer, manipuler des objets",
    icon: <Wrench className="h-10 w-10 text-teal-500" />,
    tags: ["pratique", "manuel", "technique"],
    options: [
      { text: "Très limitées", value: 10 },
      { text: "Limitées", value: 30 },
      { text: "Moyennes", value: 50 },
      { text: "Bonnes", value: 70 },
      { text: "Excellentes", value: 90 }
    ]
  },
  {
    id: 2,
    question: "Comment évaluez-vous votre créativité et votre sens artistique ?",
    description: "Votre capacité à imaginer, concevoir, innover",
    icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
    tags: ["créativité", "innovation", "art"],
    options: [
      { text: "Très limitée", value: 10 },
      { text: "Limitée", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  },
  {
    id: 3,
    question: "Comment évaluez-vous votre capacité à apprendre par vous-même ?",
    description: "Votre autonomie dans l'acquisition de nouvelles compétences",
    icon: <GraduationCap className="h-10 w-10 text-blue-500" />,
    tags: ["autodidacte", "apprentissage", "formation"],
    options: [
      { text: "Très limitée", value: 10 },
      { text: "Limitée", value: 30 },
      { text: "Moyenne", value: 50 },
      { text: "Bonne", value: 70 },
      { text: "Excellente", value: 90 }
    ]
  },
  {
    id: 4,
    question: "Quel est votre niveau d'aisance avec l'entrepreneuriat ?",
    description: "Votre capacité à prendre des initiatives, gérer et développer des projets",
    icon: <Network className="h-10 w-10 text-purple-500" />,
    tags: ["entrepreneuriat", "initiative", "gestion"],
    options: [
      { text: "Pas du tout à l'aise", value: 10 },
      { text: "Peu à l'aise", value: 30 },
      { text: "Moyennement à l'aise", value: 50 },
      { text: "À l'aise", value: 70 },
      { text: "Très à l'aise", value: 90 }
    ]
  },
  {
    id: 5,
    question: "Comment évaluez-vous vos compétences relationnelles et de communication ?",
    description: "Votre facilité à interagir, convaincre et travailler avec les autres",
    icon: <Users className="h-10 w-10 text-pink-500" />,
    tags: ["communication", "relations", "équipe"],
    options: [
      { text: "Très limitées", value: 10 },
      { text: "Limitées", value: 30 },
      { text: "Moyennes", value: 50 },
      { text: "Bonnes", value: 70 },
      { text: "Excellentes", value: 90 }
    ]
  }
];
