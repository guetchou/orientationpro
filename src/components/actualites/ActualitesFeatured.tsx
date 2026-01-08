
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, ArrowRightCircle, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Actualite } from '@/pages/Actualites';

export const ActualitesFeatured = ({ actualite }: { actualite: Actualite }) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="h-64 md:h-auto bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
          <img 
            src={actualite.image_url} 
            alt={actualite.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
            À la une
          </div>
        </div>
        
        <CardContent className="flex flex-col justify-between p-6 md:p-8">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(actualite.created_at), "d MMMM yyyy", { locale: fr })}</span>
              
              <span className="mx-2">•</span>
              
              <Tag className="h-4 w-4 mr-1" />
              <span>{actualite.category}</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">{actualite.title}</h2>
            <p className="line-clamp-3 text-muted-foreground mb-6">{actualite.description}</p>
          </div>
          
          <Button className="w-full md:w-auto gap-2">
            Lire l'article complet
            <ArrowRightCircle className="h-4 w-4" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};
