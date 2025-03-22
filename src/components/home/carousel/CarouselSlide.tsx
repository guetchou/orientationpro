
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface CarouselSlideProps {
  slide: {
    url: string;
    title: string;
    description: string;
    video: boolean;
  };
  onPlayVideo?: () => void;
}

export const CarouselSlide = ({ slide, onPlayVideo }: CarouselSlideProps) => {
  return (
    <div className="relative h-full w-full">
      {/* Image background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-10000 hover:scale-110"
        style={{ backgroundImage: `url(${slide.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 z-10">
        {slide.video && (
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
              onClick={onPlayVideo}
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
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-center max-w-md"
        >
          {slide.description}
        </motion.p>
      </div>
    </div>
  );
};
