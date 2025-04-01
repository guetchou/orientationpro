
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TestsSection } from "@/components/home/TestsSection";
import { ChatBot } from "@/components/chat/ChatBot";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function Tests() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Tests d'Orientation
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Découvrez nos tests d'orientation professionnelle scientifiquement validés pour vous aider à mieux vous connaître et à faire les bons choix pour votre avenir.
          </p>
          
          {/* Senior Employment Test Card */}
          <div className="mb-12">
            <Card className="bg-amber-50 border-amber-200 p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-amber-800 mb-3">Test d'Emploi Senior</h2>
              <p className="text-gray-700 mb-4">
                Évaluez vos atouts et talents pour une carrière épanouissante en tant que senior. Ce test analyse vos compétences 
                et expériences pour vous orienter vers les meilleures opportunités adaptées à votre situation.
              </p>
              <Link 
                to="/test-senior-employment" 
                className="inline-flex items-center text-amber-700 font-medium hover:text-amber-800"
              >
                Commencer le test <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
        <TestsSection />
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
}
