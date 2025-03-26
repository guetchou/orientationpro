
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Info, AlertCircle } from "lucide-react";

export const HorizontalCarousel = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  const carouselImages = [1, 2, 3, 4, 5, 6];

  // Vérifier si les images existent
  useEffect(() => {
    const checkImages = async () => {
      try {
        // Vérification simple pour voir si on peut accéder à au moins une image
        const testImage = new Image();
        testImage.src = "/images/carousel/orientation-1.png";
        testImage.onload = () => {
          console.log("Images du carrousel chargées avec succès");
          setImagesLoaded(true);
          setShowFallbackMessage(false);
        };
        testImage.onerror = () => {
          console.error("Images du carrousel non trouvées");
          setImagesLoaded(false);
          setShowFallbackMessage(true);
        };
      } catch (error) {
        console.error("Erreur lors de la vérification des images:", error);
        setImagesLoaded(false);
        setShowFallbackMessage(true);
      }
    };

    checkImages();
  }, []);
  
  return (
    <section className="py-8 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6 font-heading">Découvrez nos ressources d'orientation</h2>
        
        {showFallbackMessage && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">
                Les images du carousel ne sont pas disponibles. Des images de remplacement sont utilisées. 
                Ajoutez vos images dans le dossier <code>/public/images/carousel/</code> avec les noms <code>orientation-1.png</code> à <code>orientation-6.png</code>.
              </p>
            </div>
          </div>
        )}
        
        <Carousel className="mx-auto mb-6 max-w-5xl">
          <CarouselContent>
            {carouselImages.map((num) => (
              <CarouselItem key={`carousel-item-${num}`} className="md:basis-1/2 lg:basis-1/3">
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative group h-64 overflow-hidden">
                      <img 
                        src={`/images/carousel/orientation-${num}.png`} 
                        alt={`Orientation professionnelle ${num}`} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-${1550000000000 + num * 10}?auto=format&fit=crop&w=800&q=80`;
                          console.log(`Image ${num} non trouvée, utilisation d'une image de secours`);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm font-medium">Ressource d'orientation {num}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">
            Des images pour vous inspirer dans votre parcours d'orientation professionnelle
          </p>
          <div className="relative inline-block">
            <span className="absolute -top-1 -right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <p className="text-sm text-gray-500">Carrousel mis à jour régulièrement</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
