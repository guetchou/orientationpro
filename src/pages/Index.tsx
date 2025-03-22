
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
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
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Index() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced background with multiple layers for depth */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-70"></div>
        <div className="absolute inset-0 backdrop-blur-[150px]"></div>
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-30"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[120px] opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-secondary/20 rounded-full filter blur-[100px] opacity-40 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-purple/20 rounded-full filter blur-[80px] opacity-30 animate-pulse-slow animation-delay-4000"></div>
      </div>
      
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 relative z-10"
      >
        <HeroSection />
        <StepsSection />
        <TestsSection />

        {/* Nouvelle section CTA après les tests */}
        <section className="py-12 bg-primary/5 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500"
            >
              <div className="md:w-2/3">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 font-heading text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Besoin d'accompagnement personnalisé ?</h2>
                <p className="text-gray-600 mb-4">Nos conseillers d'orientation sont disponibles pour vous guider à chaque étape de votre parcours.</p>
                <div className="flex flex-wrap gap-4">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px]">
                    <Users size={18} />
                    Voir nos conseillers
                  </Button>
                  <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 transition-all duration-300">
                    <BookOpen size={18} />
                    Ressources gratuites
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.div 
                  initial={{ scale: 0.9, rotate: -5 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-300"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80" 
                    alt="Conseiller d'orientation" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <StatisticsSection />
        <TestimonialsSection />
        <ResourcesSection />
        <EventsSection />
        <PartnersSection />
        <FaqSection />
        <ContactSection />
        <ChatBot />
      </motion.main>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 p-3 bg-primary text-white rounded-full shadow-lg z-40 hover:bg-primary/90 transition-all duration-300 hover:scale-110"
            aria-label="Retour en haut"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
