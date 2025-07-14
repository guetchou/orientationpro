import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ConseillerSection } from "@/components/home/ConseillerSection";
import { StepsSection } from "@/components/home/StepsSection";
import { TestsSection } from "@/components/home/TestsSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
import { EventsSection } from "@/components/home/EventsSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { FaqSection } from "@/components/home/FaqSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ChatBot } from "@/components/chat/ChatBot";
import { ATSSection } from "@/components/home/ATSSection";
import { motion, useScroll, useSpring } from "framer-motion";
import { ScrollToTop } from "@/components/home/ScrollToTop";
import { AnimatedBackground } from "@/components/home/AnimatedBackground";
import { CTASection } from "@/components/home/CTASection";
import { HorizontalCarousel } from "@/components/home/HorizontalCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced background with multiple layers for depth */}
      <AnimatedBackground />
      
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 relative z-10"
      >
        <HeroSection />
        {/* TODO: Ajouter ici <MosalaCarousel /> pour les offres d'emploi en vedette */}
        {/* TODO: Ajouter ici <MosalaApplicationForm /> pour le formulaire de candidature */}
        {/* TODO: Ajouter ici <MosalaStatsSection /> pour des statistiques dynamiques */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <Link to="/guide-congo-2024">Guide des Études Supérieures au Congo 2024</Link>
          </Button>
        </div>
        <ConseillerSection />
        <HorizontalCarousel />
        <StepsSection />
        <TestsSection />
        <ATSSection />
        <CTASection />
        <StatisticsSection />
        <TestimonialsSection />
        <EventsSection />
        <ResourcesSection />
        <PartnersSection />
        <FaqSection />
        <ContactSection />
        <ChatBot />
      </motion.main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
