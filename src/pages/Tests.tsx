
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TestsSection } from "@/components/home/TestsSection";
import { ChatBot } from "@/components/chat/ChatBot";

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
        </div>
        <TestsSection />
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
}
