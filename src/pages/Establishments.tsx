
import React, { useState, useEffect } from 'react';
import { MapDisplay } from '@/components/home/map/MapDisplay';
import { EstablishmentList } from '@/components/home/map/EstablishmentList';
import { EstablishmentFilters } from '@/components/home/map/EstablishmentFilters';
import { MobileToggleList } from '@/components/home/map/MobileToggleList';
import { useEstablishmentData } from '@/components/home/map/useEstablishmentData';
import { Establishment } from '@/types/establishments';
import { Link } from 'react-router-dom';

const Establishments = () => {
  const { establishments, loading, filterEstablishments, selectedType, setSelectedType, searchQuery, setSearchQuery } = useEstablishmentData();
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showList, setShowList] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    if (!loading) {
      setFilteredEstablishments(establishments);
    }
  }, [establishments, loading]);

  const handleFilterChange = (filters: any) => {
    const filtered = filterEstablishments(filters);
    setFilteredEstablishments(filtered);
    setSelectedEstablishment(null);
  };

  const toggleView = () => {
    setShowList(!showList);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    handleFilterChange({ type: selectedType, query: searchQuery, city });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    handleFilterChange({ type, query: searchQuery, city: selectedCity });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    handleFilterChange({ type: selectedType, query: search, city: selectedCity });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Établissements d'enseignement</h1>
        
        <EstablishmentFilters 
          selectedCity={selectedCity}
          selectedType={selectedType}
          searchTerm={searchQuery}
          uniqueCities={establishments.map(e => e.city).filter((v, i, a) => a.indexOf(v) === i)}
          uniqueTypes={['university', 'high_school', 'vocational', 'specialized']}
          onCityChange={handleCityChange}
          onTypeChange={handleTypeChange}
          onSearchChange={handleSearchChange}
        />
        
        <MobileToggleList 
          showList={showList} 
          toggleView={toggleView} 
        />
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded">
          <h3 className="font-bold text-green-700 mb-1">Guide 2024 : Études supérieures au Congo</h3>
          <p className="text-green-800 text-sm mb-2">Consultez le guide complet pour tout savoir sur les établissements, filières, démarches et conseils pratiques.</p>
          <Link to="/guide-congo-2024" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">Accéder au guide</Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 ${!showList ? 'hidden lg:block' : ''}`}>
            <EstablishmentList 
              establishments={filteredEstablishments}
              selectedEstablishment={selectedEstablishment}
              setSelectedEstablishment={setSelectedEstablishment}
            />
          </div>
          
          <div className={`lg:col-span-2 ${showList ? 'hidden lg:block' : ''}`}>
            <MapDisplay 
              establishments={filteredEstablishments}
              selectedEstablishment={selectedEstablishment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Establishments;
