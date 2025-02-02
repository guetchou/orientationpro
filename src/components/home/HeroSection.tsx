import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-32">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Plateforme d'orientation professionnelle</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Construisez votre avenir professionnel
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Découvrez votre voie grâce à nos tests d'orientation et conseils personnalisés. 
            Prenez les bonnes décisions pour votre carrière.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">En savoir plus</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};