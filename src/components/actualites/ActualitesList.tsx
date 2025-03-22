
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { Actualite } from '@/pages/Actualites';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export const ActualitesList = ({ actualites }: { actualites: Actualite[] }) => {
  if (actualites.length === 0) {
    return (
      <div className="text-center p-12 bg-white/90 backdrop-blur rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Aucune actualité trouvée</h3>
        <p className="text-muted-foreground">
          Aucune actualité disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actualites.map((actualite) => (
        <Card key={actualite.id} className="flex flex-col h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
          <div className="h-48 overflow-hidden">
            <img 
              src={actualite.image_url} 
              alt={actualite.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <CardContent className="flex-grow pt-6 pb-4">
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(actualite.created_at), "d MMMM yyyy", { locale: fr })}</span>
              
              <div className="ml-auto flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span>{actualite.category}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{actualite.title}</h3>
            <p className="text-muted-foreground line-clamp-3 mb-4">{actualite.description}</p>
          </CardContent>
          
          <CardFooter className="pt-0 pb-6">
            <Button variant="ghost" className="px-0 hover:bg-transparent hover:text-primary">
              Lire l'article <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
