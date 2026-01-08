
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselControlsProps {
  images: any[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export const CarouselControls = ({
  images,
  currentIndex,
  onPrevious,
  onNext,
  onSelect
}: CarouselControlsProps) => {
  return (
    <>
      {/* Navigation buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
          onClick={onNext}
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
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
    </>
  );
};
