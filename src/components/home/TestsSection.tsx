
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Heart, Lightbulb, ArrowRight, CheckCircle, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TestsSection = () => {
  const navigate = useNavigate();
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  
  const tests = [
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
      path: "/test-riasec",
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
      path: "/test-emotional",
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
      path: "/test-multiple",
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
      path: "/test-learning",
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
      path: "/test-entrepreneurial",
      color: "bg-gradient-to-br from-amber-100 to-amber-50"
    }
  ];

  const handleStartTest = (path: string) => {
    navigate(path);
  };

  const nextTest = () => {
    setActiveTestIndex((prevIndex) => (prevIndex + 1) % tests.length);
  };

  const prevTest = () => {
    setActiveTestIndex((prevIndex) => (prevIndex - 1 + tests.length) % tests.length);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const activeTest = tests[activeTestIndex];

  return (
    <section id="tests" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Tests d'orientation professionnelle
          </h2>
          <p className="text-gray-600 text-lg">
            Découvrez-vous à travers nos tests scientifiquement validés et obtenez des recommandations personnalisées
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Test Selector - Mobile */}
          <div className="md:hidden space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevTest}
                className="flex-shrink-0"
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-500">
                Test {activeTestIndex + 1}/{tests.length}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextTest}
                className="flex-shrink-0"
              >
                Suivant
              </Button>
            </div>
          </div>

          {/* Interactive Test Display */}
          <motion.div
            key={activeTest.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="col-span-1 md:col-span-2"
          >
            <Card className={`h-full overflow-hidden border-0 shadow-lg ${activeTest.color}`}>
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {activeTest.duration} • {activeTest.questions} questions
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">{activeTest.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{activeTest.description}</CardDescription>
                  </div>
                  <div className="p-3 bg-white rounded-full shadow-md">
                    {activeTest.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Ce que vous découvrirez :</h4>
                  <ul className="space-y-2">
                    {activeTest.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleStartTest(activeTest.path)}
                >
                  Commencer le test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Test List for Desktop */}
          <div className="hidden md:block">
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div 
                  key={test.id}
                  onClick={() => setActiveTestIndex(index)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    index === activeTestIndex 
                      ? 'bg-white shadow-md border-l-4 border-primary' 
                      : 'hover:bg-white/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      index === activeTestIndex ? 'bg-primary/10' : 'bg-gray-100'
                    }`}>
                      {test.icon}
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        index === activeTestIndex ? 'text-primary' : 'text-gray-700'
                      }`}>
                        {test.title}
                      </h3>
                      <p className="text-sm text-gray-500">{test.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/tests')}
              >
                Voir tous les tests
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
