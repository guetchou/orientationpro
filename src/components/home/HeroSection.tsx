
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, PlayCircle, ChevronRight, Check } from "lucide-react";
import { ImageCarousel } from "./ImageCarousel";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const HeroSection = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-[100px] opacity-70 animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full filter blur-[100px] opacity-70 animate-pulse-slow animation-delay-2000" />
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={item} className="flex items-center gap-2">
              <Badge variant="outline" className="py-2 px-4 bg-white/80 backdrop-blur-sm border-primary/20 flex items-center gap-2 font-medium text-primary">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Plateforme d'orientation professionnelle
              </Badge>
            </motion.div>

            <motion.h1 variants={item} className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent drop-shadow-sm animate-gradient">
                Construisez votre avenir professionnel
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-xl text-gray-700 leading-relaxed max-w-xl">
              Découvrez votre voie grâce à nos tests d'orientation et conseils personnalisés. 
              Prenez les bonnes décisions pour votre carrière.
            </motion.p>

            {/* Boutons avec animations */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 gap-2 shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px]">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 border-primary/20 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300">
                <PlayCircle className="w-5 h-5" />
                Voir la démo
              </Button>
            </motion.div>

            {/* Preuves sociales */}
            <motion.div variants={item} className="space-y-4">
              <p className="text-sm font-medium text-gray-600">Des milliers d'étudiants nous font confiance</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { color: "bg-green-500", label: "Plus de 5000 utilisateurs" },
                  { color: "bg-blue-500", label: "95% de satisfaction" },
                  { color: "bg-secondary", label: "Résultats immédiats" }
                ].map((el, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${el.color} animate-pulse`} />
                    <span className="text-sm">{el.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Avantages */}
            <motion.div variants={item} className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium mb-3 text-gray-700">Avantages exclusifs</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Tests d'orientation complets",
                  "Accompagnement personnalisé",
                  "Suggestions de formations adaptées",
                  "Ressources pédagogiques gratuites"
                ].map((advantage, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-0.5 bg-green-100 p-1 rounded-full text-green-600">
                      <Check size={12} />
                    </div>
                    <span className="text-sm text-gray-600">{advantage}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Côté carrousel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:block relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-2xl transform rotate-6 scale-95 blur-xl opacity-30 animate-pulse-slow" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/20 group hover:scale-[1.01] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 backdrop-blur-sm z-10" />
              <ImageCarousel />

              {/* Call-to-action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute bottom-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">Débutez votre parcours</h3>
                    <p className="text-xs text-gray-500 mb-2">Passez votre premier test d'orientation</p>
                    <Link to="/tests" className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                      Commencer maintenant
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Éléments décoratifs */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-secondary/30 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl" />

            {/* Badge flottant */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="absolute -top-4 right-20 z-20"
            >
              <div className="bg-white rounded-full px-3 py-1 shadow-lg flex items-center gap-2 text-sm font-medium text-primary border border-primary/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Tests validés scientifiquement
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
