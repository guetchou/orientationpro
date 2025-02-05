import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, PlayCircle } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      <div className="absolute inset-y-0 right-0 hidden lg:block w-1/3">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/10 to-transparent" />
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')] bg-cover bg-center opacity-50" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium">Plateforme d'orientation professionnelle</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight animate-fade-in [--animate-delay:200ms]">
            Construisez votre avenir professionnel
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in [--animate-delay:400ms]">
            Découvrez votre voie grâce à nos tests d'orientation et conseils personnalisés. 
            Prenez les bonnes décisions pour votre carrière.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in [--animate-delay:600ms]">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2">
              <PlayCircle className="w-5 h-5" />
              Voir la démo
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-gray-600 animate-fade-in [--animate-delay:800ms]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Plus de 5000 utilisateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>95% de satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};