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
      
      <main className="relative overflow-hidden">
        {/* Hero Section avec animation d'entrée */}
        <div className="animate-fade-in [--animate-delay:200ms]">
          <HeroSection />
        </div>

        {/* Tests Section avec effet de parallaxe */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="animate-fade-in [--animate-delay:400ms]">
            <TestsSection />
          </div>
        </div>

        {/* Steps Section avec animation au défilement */}
        <div className="animate-fade-in [--animate-delay:600ms]">
          <StepsSection />
        </div>

        {/* Statistics Section avec effet de glassmorphisme */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
          <div className="animate-fade-in [--animate-delay:800ms]">
            <StatisticsSection />
          </div>
        </div>

        {/* Resources Section avec grille responsive */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white pointer-events-none" />
          <div className="animate-fade-in [--animate-delay:1000ms]">
            <ResourcesSection />
          </div>
        </div>

        {/* Events Section avec effet de profondeur */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          <div className="animate-fade-in [--animate-delay:1200ms]">
            <EventsSection />
          </div>
        </div>

        {/* Blog et Testimonials avec animation au survol */}
        <div className="space-y-20">
          <div className="animate-fade-in [--animate-delay:1400ms]">
            <BlogSection />
          </div>
          <div className="animate-fade-in [--animate-delay:1600ms]">
            <TestimonialsSection />
          </div>
        </div>

        {/* Partners et Contact avec effet de glassmorphisme */}
        <div className="space-y-20">
          <div className="animate-fade-in [--animate-delay:1800ms]">
            <PartnersSection />
          </div>
          <div className="animate-fade-in [--animate-delay:2000ms]">
            <ContactSection />
          </div>
        </div>
      </main>

      {/* Footer amélioré avec animation */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold mb-4">Orientation Pro Congo</h3>
              <p className="text-gray-400">
                Votre partenaire pour l'orientation scolaire et professionnelle au Congo Brazzaville
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Tests d'orientation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bilan de compétences</li>
                <li className="hover:text-white transition-colors cursor-pointer">Conseils carrière</li>
                <li className="hover:text-white transition-colors cursor-pointer">Reconversion professionnelle</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">À propos</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Confidentialité</li>
                <li className="hover:text-white transition-colors cursor-pointer">Conditions d'utilisation</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Brazzaville, Congo</li>
                <li className="hover:text-white transition-colors cursor-pointer">contact@orientationprocongo.com</li>
                <li>+242 XX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Orientation Pro Congo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Bouton de retour en haut avec animation */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 animate-fade-in z-50"
          size="icon"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;