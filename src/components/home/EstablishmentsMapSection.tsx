
import React, { useState } from 'react';
import { MapDisplay } from "./map/MapDisplay";
import { EstablishmentFilters } from "./map/EstablishmentFilters";
import { EstablishmentList } from "./map/EstablishmentList";
import { Establishment } from "@/types/establishments";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEstablishmentData } from './map/useEstablishmentData';
import { MobileToggleList } from './map/MobileToggleList';
import { Link } from 'react-router-dom';

export const EstablishmentsMapSection = () => {
  const {
    establishments, 
    filteredEstablishments, 
    selectedType, 
    setSelectedType,
    searchQuery, 
    setSearchQuery,
    filterEstablishments
  } = useEstablishmentData();
  
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    filterEstablishments({ type: selectedType, query: searchQuery, city });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    filterEstablishments({ type, query: searchQuery, city: selectedCity });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    filterEstablishments({ type: selectedType, query: search, city: selectedCity });
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-heading font-bold mb-4">
            Découvrez les Établissements d'Enseignement
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez la carte interactive des établissements d'enseignement au Congo et trouvez celui qui correspond à vos aspirations académiques et professionnelles.
          </p>
        </motion.div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 relative">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="sticky top-24 space-y-6">
              <EstablishmentFilters 
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
                searchTerm={searchQuery}
                onSearchChange={handleSearchChange}
                selectedCity={selectedCity}
                onCityChange={handleCityChange}
                uniqueCities={establishments.map(e => e.city).filter((v, i, a) => a.indexOf(v) === i)}
                uniqueTypes={['university', 'vocational', 'high_school', 'specialized']}
              />
              
              <MobileToggleList 
                showList={isMobileListOpen} 
                toggleView={() => setIsMobileListOpen(!isMobileListOpen)} 
              />
              
              <div className={`lg:block ${isMobileListOpen ? 'block' : 'hidden'}`}>
                <EstablishmentList 
                  establishments={filteredEstablishments}
                  selectedEstablishment={selectedEstablishment}
                  setSelectedEstablishment={setSelectedEstablishment}
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 h-[500px] rounded-xl overflow-hidden shadow-lg">
            <MapDisplay 
              establishments={filteredEstablishments} 
              selectedEstablishment={selectedEstablishment}
            />
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Link to="/establishments">
            <Button variant="outline" className="gap-2">
              Voir tous les établissements
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
