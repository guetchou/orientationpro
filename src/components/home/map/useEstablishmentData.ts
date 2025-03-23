
import { useState, useEffect } from 'react';
import { Establishment } from '@/types/establishments';

// Mock establishments data for development
const mockEstablishments: Establishment[] = [
  {
    id: '1',
    name: 'Université de Paris',
    type: 'university',
    address: '12 Rue de l\'Université, 75007 Paris',
    website: 'https://u-paris.fr',
    phone: '+33 1 57 27 57 27',
    email: 'contact@u-paris.fr',
    coordinates: [2.3522, 48.8566],
    ratings: 4.5,
    reviewCount: 120,
    programs: ['Science', 'Arts', 'Medicine'],
    image: '/images/establishments/university-paris.jpg',
  },
  {
    id: '2',
    name: 'Lycée Henri-IV',
    type: 'high_school',
    address: '23 Rue Clovis, 75005 Paris',
    website: 'https://lycee-henri4.com',
    phone: '+33 1 44 41 21 21',
    email: 'contact@henri4.fr',
    coordinates: [2.3469, 48.8461],
    ratings: 4.8,
    reviewCount: 95,
    programs: ['Science', 'Literature', 'Economics'],
    image: '/images/establishments/lycee-henri4.jpg',
  },
  {
    id: '3',
    name: 'École Polytechnique',
    type: 'specialized',
    address: 'Route de Saclay, 91128 Palaiseau',
    website: 'https://www.polytechnique.edu',
    phone: '+33 1 69 33 33 33',
    email: 'contact@polytechnique.fr',
    coordinates: [2.2137, 48.7147],
    ratings: 4.9,
    reviewCount: 150,
    programs: ['Engineering', 'Computer Science', 'Physics'],
    image: '/images/establishments/polytechnique.jpg',
  },
];

export const useEstablishmentData = () => {
  const [establishments, setEstablishments] = useState<Establishment[]>(mockEstablishments);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>(mockEstablishments);
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setEstablishments(mockEstablishments);
      setFilteredEstablishments(mockEstablishments);
      setLoading(false);
    }, 500);
  }, []);

  const filterEstablishments = (filters: { type?: string; query?: string }) => {
    const { type, query } = filters;
    
    return establishments.filter(establishment => {
      const matchesType = !type || establishment.type === type;
      const matchesQuery = !query || 
        establishment.name.toLowerCase().includes(query.toLowerCase()) ||
        establishment.address.toLowerCase().includes(query.toLowerCase());
      
      return matchesType && matchesQuery;
    });
  };

  return {
    establishments,
    filteredEstablishments,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    loading,
    filterEstablishments
  };
};
