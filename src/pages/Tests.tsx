import { TestsSection } from "@/components/home/TestsSection";
import { ChatBot } from "@/components/chat/ChatBot";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Heart, Lightbulb, BookOpen, RefreshCw, Award, Briefcase, LineChart, CheckCircle } from "lucide-react";

export default function Tests() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Tests d'Orientation
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Découvrez nos tests d'orientation professionnelle scientifiquement validés pour vous aider à mieux vous connaître et à faire les bons choix pour votre avenir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* RIASEC Test Card */}
            <Card className="bg-indigo-50 border-indigo-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-indigo-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-indigo-800">Test RIASEC</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">15-20 min • 60 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Découvrez vos intérêts professionnels dominants selon la théorie des types de personnalité RIASEC de John Holland.
              </p>
              <Link 
                to="/tests/riasec" 
                className="inline-flex items-center text-indigo-700 font-medium hover:text-indigo-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* Emotional Intelligence Test Card */}
            <Card className="bg-pink-50 border-pink-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-pink-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-pink-800">Test d'Intelligence Émotionnelle</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">10-15 min • 45 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Évaluez votre capacité à comprendre et gérer vos émotions et celles des autres pour améliorer vos relations professionnelles.
              </p>
              <Link 
                to="/tests/emotional" 
                className="inline-flex items-center text-pink-700 font-medium hover:text-pink-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* Learning Style Test Card */}
            <Card className="bg-green-50 border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-green-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-green-800">Test de Styles d'Apprentissage</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">10 min • 30 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Découvrez votre façon préférée d'apprendre et de traiter l'information pour optimiser votre développement professionnel.
              </p>
              <Link 
                to="/tests/learning" 
                className="inline-flex items-center text-green-700 font-medium hover:text-green-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* Multiple Intelligence Test Card */}
            <Card className="bg-purple-50 border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-purple-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-purple-800">Test des Intelligences Multiples</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">15 min • 40 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Identifiez vos types d'intelligence dominants selon la théorie de Gardner pour mieux orienter votre parcours professionnel.
              </p>
              <Link 
                to="/tests/multiple" 
                className="inline-flex items-center text-purple-700 font-medium hover:text-purple-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* Career Transition Test Card */}
            <Card className="bg-blue-50 border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-blue-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-blue-800">Test de Reconversion Professionnelle</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">12-15 min • 35 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Évaluez votre préparation à une reconversion et identifiez les domaines professionnels qui correspondent le mieux à vos compétences transférables.
              </p>
              <Link 
                to="/tests/career-transition" 
                className="inline-flex items-center text-blue-700 font-medium hover:text-blue-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* No Diploma Career Test Card */}
            <Card className="bg-teal-50 border-teal-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-teal-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-teal-800">Test d'Orientation Sans Diplôme</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">10-12 min • 30 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Découvrez les opportunités professionnelles adaptées à vos compétences et à votre personnalité, même sans diplôme ou qualification formelle.
              </p>
              <Link 
                to="/tests/no-diploma" 
                className="inline-flex items-center text-teal-700 font-medium hover:text-teal-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>

            {/* Senior Employment Test Card */}
            <Card className="bg-amber-50 border-amber-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-amber-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-amber-800">Test d'Emploi Senior</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">8-10 min • 20 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Évaluez vos atouts et talents pour une carrière épanouissante en tant que senior. Ce test analyse vos compétences 
                et expériences pour vous orienter vers les meilleures opportunités adaptées à votre situation.
              </p>
              <Link 
                to="/tests/senior-employment" 
                className="inline-flex items-center text-amber-700 font-medium hover:text-amber-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>
            
            {/* Entrepreneurial Test Card - NOUVEAU */}
            <Card className="bg-amber-50 border-amber-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-amber-100 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                  <LineChart className="w-8 h-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-amber-800">Test d'Aptitude Entrepreneuriale</h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">10-12 min • 15 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Découvrez votre profil professionnel : entrepreneur, salarié, commerçant, artisan, candidat à l'expatriation 
                ou si vous préférez un mode de vie plus libre. Ce test vous aide à comprendre vos préférences fondamentales.
              </p>
              <Link 
                to="/tests/entrepreneurial" 
                className="inline-flex items-center text-amber-700 font-medium hover:text-amber-800 transition-all duration-300 hover:translate-x-1"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>
          </div>
        </div>
        <TestsSection />
      </main>
      <ChatBot />
    </div>
  );
}
