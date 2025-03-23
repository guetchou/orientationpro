
export interface Establishment {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  neighborhood?: string;
  programs?: string[];
  website?: string;
}

export interface EstablishmentFiltersProps {
  selectedCity: string;
  selectedType: string;
  searchTerm: string;
  uniqueCities: string[];
  uniqueTypes: string[];
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onSearchChange: (search: string) => void;
}
