
import React, { useState } from 'react';
import { Newspaper, Calendar, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ActualitesHeaderProps {
  onSearch: (term: string) => void;
}

export const ActualitesHeader = ({ onSearch }: ActualitesHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center mb-4">
        <Newspaper className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-4xl md:text-5xl font-bold font-heading">Actualités</h1>
      </div>
      
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Restez informé des dernières nouvelles et événements concernant l'orientation professionnelle au Congo
      </p>
      
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto mt-8 flex items-center">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une actualité..."
          className="pl-10 pr-20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-1 top-1 h-8"
        >
          Rechercher
        </Button>
      </form>
    </div>
  );
};
