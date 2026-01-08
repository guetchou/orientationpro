import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sophie Mbemba",
      role: "Étudiante en médecine",
      avatar: "/images/carousel/orientation-3.png",
      content: "Les tests d'orientation m'ont vraiment aidée à confirmer mon choix de carrière. Les résultats détaillés et les conseils personnalisés ont été déterminants dans ma décision de poursuivre des études de médecine.",
      university: "Université Marien Ngouabi",
      rating: 5,
      location: "Brazzaville"
    },
    {
      id: 2,
      name: "Jean Makaya",
      role: "Ingénieur logiciel",
      avatar: "/images/carousel/orientation-4.png",
      content: "Grâce à Orientation Pro Congo, j'ai pu identifier mes points forts et mes domaines d'amélioration. Les ressources proposées m'ont permis de développer mes compétences et d'évoluer professionnellement.",
      company: "Tech Congo",
      rating: 5,
      location: "Pointe-Noire"
    },
    {
      id: 3,
      name: "Marie Nguesso",
      role: "Lycéenne en Terminale",
      avatar: "/images/carousel/orientation-5.png",
      content: "J'étais complètement perdue concernant mon orientation. Les tests et l'accompagnement m'ont aidée à découvrir des filières qui correspondent à mes intérêts et à mes capacités.",
      school: "Lycée Savorgnan de Brazza",
      rating: 5,
      location: "Brazzaville"
    },
    {
      id: 4,
      name: "David Kimbouala",
      role: "Conseiller d'orientation",
      avatar: "/images/carousel/orientation-6.png",
      content: "En tant que conseiller, j'utilise Orientation Pro Congo avec mes élèves. Les résultats sont toujours pertinents et fiables. C'est un outil précieux pour notre profession.",
      company: "Centre d'Orientation Scolaire",
      rating: 5,
      location: "Dolisie"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les expériences authentiques de nos utilisateurs et comment nous les avons aidés dans leur parcours
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8 lg:p-12">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Photo du témoin */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative"
                      >
                        <div className="relative">
                          <div 
                            className="w-48 h-48 mx-auto rounded-full bg-cover bg-center border-4 border-yellow-400 shadow-2xl"
                            style={{
                              backgroundImage: `url('${testimonials[currentIndex].avatar}')`
                            }}
                          />
                          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <Quote className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Informations du témoin */}
                        <div className="text-center mt-6">
                          <h4 className="font-bold text-xl text-gray-900 mb-1">
                            {testimonials[currentIndex].name}
                          </h4>
                          <p className="text-blue-600 font-medium mb-1">
                            {testimonials[currentIndex].role}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {testimonials[currentIndex].university || 
                             testimonials[currentIndex].company || 
                             testimonials[currentIndex].school}
                          </p>
                          <p className="text-xs text-gray-500">
                            📍 {testimonials[currentIndex].location}
                          </p>
                        </div>
                      </motion.div>

                      {/* Contenu du témoignage */}
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-center lg:justify-start mb-4">
                          {renderStars(testimonials[currentIndex].rating)}
                        </div>
                        
                        <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed italic">
                          "{testimonials[currentIndex].content}"
                        </blockquote>
                        
                        <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Témoignage vérifié</span>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {/* Indicateurs */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
