
import React from 'react';
import { Button } from "@/components/ui/button";
import { BadgeCheck, Tag, HashIcon } from 'lucide-react';

interface ActualitesCategoriesProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const ActualitesCategories = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: ActualitesCategoriesProps) => {
  return (
    <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Tag className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-semibold">Catégories</h3>
      </div>
      
      <div className="space-y-2">
        <Button 
          variant={selectedCategory === null ? "default" : "ghost"}
          className="justify-start w-full font-normal"
          onClick={() => onSelectCategory(null)}
        >
          <HashIcon className="h-4 w-4 mr-2" />
          Toutes les actualités
          {selectedCategory === null && <BadgeCheck className="h-4 w-4 ml-auto" />}
        </Button>
        
        {categories.map((category) => (
          <Button 
            key={category}
            variant={selectedCategory === category ? "default" : "ghost"}
            className="justify-start w-full font-normal"
            onClick={() => onSelectCategory(category)}
          >
            <HashIcon className="h-4 w-4 mr-2" />
            {category}
            {selectedCategory === category && <BadgeCheck className="h-4 w-4 ml-auto" />}
          </Button>
        ))}
      </div>
    </div>
  );
};
