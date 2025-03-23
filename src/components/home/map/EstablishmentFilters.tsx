
import React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EstablishmentFiltersProps } from '@/types/establishments';

export const EstablishmentFilters: React.FC<EstablishmentFiltersProps> = ({
  selectedCity,
  selectedType,
  searchTerm,
  uniqueCities,
  uniqueTypes,
  onCityChange,
  onTypeChange,
  onSearchChange,
  // Pour compatibilité avec l'implémentation existante
  setSelectedType
}) => {
  const handleTypeChange = (type: string) => {
    if (onTypeChange) {
      onTypeChange(type);
    } else if (setSelectedType) {
      setSelectedType(type);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Rechercher un établissement..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedCity === 'all' ? 'Toutes' : selectedCity}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onCityChange('all')}>
                <span className="flex items-center">
                  {selectedCity === 'all' && (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Toutes
                </span>
              </DropdownMenuItem>
              {uniqueCities.map((city) => (
                <DropdownMenuItem key={city} onClick={() => onCityChange(city)}>
                  <span className="flex items-center">
                    {selectedCity === city && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {city}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedType === '' ? 'Tous' : 
                  selectedType === 'university' ? 'Université' :
                  selectedType === 'high_school' ? 'Lycée' :
                  selectedType === 'vocational' ? 'Formation Pro' : 
                  selectedType === 'specialized' ? 'École Spécialisée' : 
                  selectedType}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleTypeChange('')}>
                <span className="flex items-center">
                  {selectedType === '' && <Check className="h-4 w-4 mr-2" />}
                  Tous
                </span>
              </DropdownMenuItem>
              {uniqueTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleTypeChange(type)}
                >
                  <span className="flex items-center">
                    {selectedType === type && <Check className="h-4 w-4 mr-2" />}
                    {type === 'university' ? 'Université' :
                     type === 'high_school' ? 'Lycée' :
                     type === 'vocational' ? 'Formation Pro' : 
                     type === 'specialized' ? 'École Spécialisée' : 
                     type}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentFilters;
