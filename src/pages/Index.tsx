import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { TestsSection } from "@/components/home/TestsSection";
import { StepsSection } from "@/components/home/StepsSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
import { EventsSection } from "@/components/home/EventsSection";
import { BlogSection } from "@/components/home/BlogSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ContactSection } from "@/components/home/ContactSection";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      <main>
        <HeroSection />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <TestsSection />
        </div>
        <StepsSection />
        <StatisticsSection />
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white pointer-events-none" />
          <ResourcesSection />
        </div>
        <EventsSection />
        <TestimonialsSection />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          <BlogSection />
        </div>
        <PartnersSection />
        <ContactSection />
      </main>

      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Orientation Pro Congo</h3>
              <p className="text-gray-400">
                Votre partenaire pour l'orientation scolaire et professionnelle au Congo Brazzaville
              </p>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors">Tests d'orientation</li>
                <li className="hover:text-white transition-colors">Bilan de compétences</li>
                <li className="hover:text-white transition-colors">Conseils carrière</li>
                <li className="hover:text-white transition-colors">Reconversion professionnelle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors">À propos</li>
                <li className="hover:text-white transition-colors">Contact</li>
                <li className="hover:text-white transition-colors">Confidentialité</li>
                <li className="hover:text-white transition-colors">Conditions d'utilisation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Brazzaville, Congo</li>
                <li>contact@orientationprocongo.com</li>
                <li>+242 XX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Orientation Pro Congo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 animate-fade-in"
          size="icon"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;