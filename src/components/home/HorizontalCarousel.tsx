
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const HorizontalCarousel = () => {
  const [duplicateImages, setDuplicateImages] = useState(false);

  // Vérifier si les images existent
  useEffect(() => {
    const checkImages = async () => {
      try {
        // Vérification simple pour voir si on peut accéder à au moins une image
        const testImage = new Image();
        testImage.src = "/images/carousel/orientation-1.png";
        testImage.onload = () => {
          console.log("Images du carrousel chargées avec succès");
          setDuplicateImages(true);
        };
        testImage.onerror = () => {
          console.error("Images du carrousel non trouvées");
          setDuplicateImages(false);
        };
      } catch (error) {
        console.error("Erreur lors de la vérification des images:", error);
        setDuplicateImages(false);
      }
    };

    checkImages();
  }, []);

  return (
    <section className="py-8 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6 font-heading">Découvrez nos ressources d'orientation</h2>
        
        <div className="overflow-hidden whitespace-nowrap rounded-xl shadow-xl mb-6">
          <div className="inline-flex animate-carousel-slide">
            {/* Premier ensemble d'images */}
            <div className="inline-flex">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={`image-${num}`} className="w-80 h-64 mx-2 inline-block">
                  <img 
                    src={`/images/carousel/orientation-${num}.png`} 
                    alt={`Orientation professionnelle ${num}`} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158";
                      console.log(`Image ${num} non trouvée, utilisation d'une image de secours`);
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Duplication des images pour l'effet de défilement infini */}
            {duplicateImages && (
              <div className="inline-flex">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={`image-duplicate-${num}`} className="w-80 h-64 mx-2 inline-block">
                    <img 
                      src={`/images/carousel/orientation-${num}.png`} 
                      alt={`Orientation professionnelle ${num}`} 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
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
