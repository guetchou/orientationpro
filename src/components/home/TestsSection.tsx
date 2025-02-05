import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Lightbulb, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const TestsSection = () => {
  const tests = [
    {
      title: "Test RIASEC",
      description: "Découvrez vos intérêts professionnels et les métiers qui vous correspondent",
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      link: "/test-riasec",
      color: "from-blue-50 to-blue-100/50"
    },
    {
      title: "Intelligence Émotionnelle",
      description: "Évaluez votre capacité à comprendre et gérer les émotions",
      icon: <Brain className="w-6 h-6 text-secondary" />,
      link: "/test-emotional",
      color: "from-orange-50 to-orange-100/50"
    },
    {
      title: "Intelligences Multiples",
      description: "Identifiez vos différents types d'intelligence selon la théorie de Gardner",
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      link: "/test-multiple",
      color: "from-yellow-50 to-yellow-100/50"
    },
    {
      title: "Style d'Apprentissage",
      description: "Découvrez votre façon préférée d'apprendre et de traiter l'information",
      icon: <BookOpen className="w-6 h-6 text-green-500" />,
      link: "/test-learning",
      color: "from-green-50 to-green-100/50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Nos Tests d'Orientation
          </h2>
          <p className="text-gray-600">
            Des tests scientifiquement validés pour vous aider à mieux vous connaître et à faire les bons choix
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tests.map((test) => (
            <Link to={test.link} key={test.title} className="group">
              <Card className={`h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${test.color} border-none`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {test.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {test.title}
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group-hover:translate-x-2 transition-transform w-full justify-between">
                    Commencer le test
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};