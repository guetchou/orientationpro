import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Lightbulb, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export const TestsSection = () => {
  const tests = [
    {
      title: "Test RIASEC",
      description: "Découvrez vos intérêts professionnels et les métiers qui vous correspondent",
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      link: "/test-riasec"
    },
    {
      title: "Intelligence Émotionnelle",
      description: "Évaluez votre capacité à comprendre et gérer les émotions",
      icon: <Brain className="w-6 h-6 text-secondary" />,
      link: "/test-emotional"
    },
    {
      title: "Intelligences Multiples",
      description: "Identifiez vos différents types d'intelligence selon la théorie de Gardner",
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      link: "/test-multiple"
    },
    {
      title: "Style d'Apprentissage",
      description: "Découvrez votre façon préférée d'apprendre et de traiter l'information",
      icon: <BookOpen className="w-6 h-6 text-secondary" />,
      link: "/test-learning"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Nos Tests d'Orientation
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tests.map((test) => (
            <Link to={test.link} key={test.title}>
              <Card className="h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {test.icon}
                  </div>
                  <CardTitle className="text-xl">{test.title}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};