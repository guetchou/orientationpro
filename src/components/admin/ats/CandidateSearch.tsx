
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter } from 'lucide-react';

interface CandidateSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onExport: () => void;
  isMobile: boolean;
  onAddNew: () => void;
}

export const CandidateSearch: React.FC<CandidateSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onExport,
  isMobile,
  onAddNew
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4 transition-all duration-300 ease-in-out">
      {/* Recherche et filtres - version adaptative */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input 
            placeholder="Rechercher un candidat..." 
            className="pl-10 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary/30" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary/30">
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <SelectValue placeholder="Filtrer par statut" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="new">Nouveaux</SelectItem>
            <SelectItem value="screening">Présélection</SelectItem>
            <SelectItem value="interview">Entretien</SelectItem>
            <SelectItem value="offer">Offre</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Boutons d'action - version adaptative */}
      <div className="flex gap-2 justify-end">
        <Button 
          onClick={onAddNew} 
          variant="outline"
          className="transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white"
        >
          {!isMobile && <span className="mr-2">+</span>}
          {isMobile ? "+" : "Nouveau"}
        </Button>
        <Button 
          onClick={onExport} 
          variant="outline"
          className="transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white"
        >
          {!isMobile && <Download className="mr-2 h-4 w-4" />}
          {isMobile ? "CSV" : "Exporter"}
        </Button>
      </div>
    </div>
  );
};
