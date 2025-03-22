
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const images = [
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Découvrez votre voie",
    description: "Tests d'orientation personnalisés",
    video: false
  },
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    title: "Guidance professionnelle",
    description: "Accompagnement personnalisé pour votre carrière",
    video: false
  },
  {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
    title: "Formations adaptées",
    description: "Trouvez la formation qui vous correspond",
    video: true
  },
  {
    url: "https://images.unsplash.com/photo-1590650153855-d9e808231d41",
    title: "Réussite académique",
    description: "Préparez votre avenir professionnel",
    video: false
  }
];

export const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    })
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const pauseCarousel = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Auto-resume after 10 seconds
  };

  return (
    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 }
          }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            {/* Image background with overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-10000 hover:scale-110"
              style={{ backgroundImage: `url(${images[currentIndex].url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 z-10">
              {images[currentIndex].video && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-16 h-16 rounded-full bg-white/20 border-white backdrop-blur-sm hover:bg-white/30 hover:scale-110 transition-all duration-300"
                    onClick={pauseCarousel}
                  >
                    <Play size={24} className="text-white ml-1" />
                  </Button>
                </motion.div>
              )}
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-heading font-bold text-center mb-4"
              >
                {images[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-center max-w-md"
              >
                {images[currentIndex].description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50"
            }`}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
              pauseCarousel();
            }}
          />
        ))}
      </div>
    </div>
  );
};
