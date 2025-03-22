
import React, { useState, useEffect } from 'react';
import { MapDisplay } from '@/components/home/map/MapDisplay';
import { EstablishmentList } from '@/components/home/map/EstablishmentList';
import { EstablishmentFilters } from '@/components/home/map/EstablishmentFilters';
import { MobileToggleList } from '@/components/home/map/MobileToggleList';
import { useEstablishmentData } from '@/components/home/map/useEstablishmentData';
import { Establishment } from '@/types/establishments';

const Establishments = () => {
  const { establishments, loading, filterEstablishments } = useEstablishmentData();
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    setFilteredEstablishments(establishments);
  }, [establishments]);

  const handleFilterChange = (filters: any) => {
    const filtered = filterEstablishments(filters);
    setFilteredEstablishments(filtered);
    setSelectedEstablishment(null);
  };

  const toggleView = () => {
    setShowList(!showList);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Établissements d'enseignement</h1>
        
        <EstablishmentFilters onFilterChange={handleFilterChange} />
        
        <MobileToggleList showList={showList} toggleView={toggleView} />
        
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
