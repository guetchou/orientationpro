
import { useState, useEffect } from 'react';
import { Establishment } from "@/types/establishments";
import { fetchEstablishments } from "./mapUtils";

export const useEstablishmentData = () => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch establishments on component mount
  useEffect(() => {
    const fetchedEstablishments = fetchEstablishments();
    setEstablishments(fetchedEstablishments);
    setFilteredEstablishments(fetchedEstablishments);
  }, []);

  // Filter establishments based on type and search query
  useEffect(() => {
    let filtered = establishments;

    if (selectedType !== 'all') {
      filtered = filtered.filter(est => est.type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(est => 
        est.name.toLowerCase().includes(query) || 
        est.description.toLowerCase().includes(query) ||
        (est.neighborhood && est.neighborhood.toLowerCase().includes(query))
      );
    }

    setFilteredEstablishments(filtered);
  }, [selectedType, searchQuery, establishments]);

  return {
    establishments,
    filteredEstablishments,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery
  };
};
