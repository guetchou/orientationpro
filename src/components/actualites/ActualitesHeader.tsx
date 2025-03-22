
import React from 'react';
import { Newspaper, Calendar, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export const ActualitesHeader = () => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center mb-4">
        <Newspaper className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-4xl md:text-5xl font-bold font-heading">Actualités</h1>
      </div>
      
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Restez informé des dernières nouvelles et événements concernant l'orientation professionnelle au Congo
      </p>
      
      <div className="relative max-w-md mx-auto mt-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une actualité..."
          className="pl-10"
        />
      </div>
    </div>
  );
};
