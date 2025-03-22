
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CarouselControls } from "./carousel/CarouselControls";
import { CarouselSlide } from "./carousel/CarouselSlide";

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

  const selectSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    pauseCarousel();
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
          <CarouselSlide 
            slide={images[currentIndex]} 
            onPlayVideo={pauseCarousel}
          />
        </motion.div>
      </AnimatePresence>

      <CarouselControls
        images={images}
        currentIndex={currentIndex}
        onPrevious={prevSlide}
        onNext={nextSlide}
        onSelect={selectSlide}
      />
    </div>
  );
};
