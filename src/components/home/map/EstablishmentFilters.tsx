
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export interface EstablishmentFiltersProps {
  onFilterChange?: (filters: any) => void;
  selectedType?: string;
  setSelectedType?: (type: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const EstablishmentFilters: React.FC<EstablishmentFiltersProps> = ({
  onFilterChange = () => {},
  selectedType = '',
  setSelectedType = () => {},
  searchQuery = '',
  setSearchQuery = () => {}
}) => {
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onFilterChange({ type: value, query: searchQuery });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onFilterChange({ type: selectedType, query: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Rechercher un établissement..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Type d'établissement" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              <SelectItem value="university">Université</SelectItem>
              <SelectItem value="high_school">Lycée</SelectItem>
              <SelectItem value="college">Collège</SelectItem>
              <SelectItem value="professional">Formation professionnelle</SelectItem>
              <SelectItem value="specialized">École spécialisée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedType('');
            setSearchQuery('');
            onFilterChange({ type: '', query: '' });
          }}
          className="md:self-end"
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default EstablishmentFilters;
