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

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        <HeroSection />
        <TestsSection />
        <StepsSection />
        <StatisticsSection />
        <ResourcesSection />
        <EventsSection />
        <TestimonialsSection />
        <BlogSection />
        <PartnersSection />
        <ContactSection />
      </main>

      <footer className="bg-gray-900 text-white py-12">
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
                <li>Tests d'orientation</li>
                <li>Bilan de compétences</li>
                <li>Conseils carrière</li>
                <li>Reconversion professionnelle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li>À propos</li>
                <li>Contact</li>
                <li>Confidentialité</li>
                <li>Conditions d'utilisation</li>
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
        </div>
      </footer>
    </div>
  );
};

export default Index;