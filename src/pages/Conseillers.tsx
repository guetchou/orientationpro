import React, { useState, useEffect } from "react";
import { CounselorCard } from "@/components/counselors/CounselorCard"; 
import { CounselorFilter } from "@/components/counselors/CounselorFilter";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter, Users, Star, Clock, MapPin, Phone, Mail, Target, CheckCircle, Award } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Conseillers() {
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: "all",
    availability: "all",
  });
  // Add state variables for the filter props
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([
    "Orientation scolaire",
    "Reconversion",
    "Insertion professionnelle",
    "Bilan de compétences",
    "Coaching carrière"
  ]);

  useEffect(() => {
    const fetchCounselors = async () => {
      setIsLoading(true);
      try {
        // Fetch counselors from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('position', 'conseiller')
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        setCounselors(data || []);
      } catch (error) {
        console.error('Error fetching counselors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounselors();
  }, []);

  // Handle specialty toggle
  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  // Filter counselors based on selected filters and search term
  const filteredCounselors = counselors.filter((counselor: any) => {
    // Filter by search term
    if (searchTerm && !`${counselor.first_name} ${counselor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !counselor.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by specialties
    if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(counselor.department)) {
      return false;
    }
    
    // Apply specialty filter if not "all"
    if (filters.specialty !== "all" && counselor.department !== filters.specialty) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
        >
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                Équipe d'Experts
              </Badge>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Nos Conseillers d'Orientation
          </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Rencontrez notre équipe de conseillers certifiés pour un accompagnement personnalisé 
                dans votre parcours d'orientation scolaire et professionnelle.
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Experts Certifiés</h3>
                <p className="text-gray-600">Conseillers diplômés et expérimentés</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accompagnement Personnalisé</h3>
                <p className="text-gray-600">Suivi adapté à vos besoins spécifiques</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Méthodes Scientifiques</h3>
                <p className="text-gray-600">Tests et outils validés scientifiquement</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de recherche et filtres */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold mb-4">Trouvez votre Conseiller</h2>
              <p className="text-gray-600">
                Utilisez les filtres ci-dessous pour trouver le conseiller qui correspond le mieux à vos besoins
          </p>
        </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
          <CounselorFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            availableSpecialties={availableSpecialties}
            onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})}
            currentFilters={filters}
          />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section des conseillers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
        {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
                  >
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                  </motion.div>
            ))}
          </div>
        ) : filteredCounselors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCounselors.map((counselor, index) => (
                  <motion.div
                    key={counselor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <CounselorCard counselor={counselor} />
                  </motion.div>
            ))}
          </div>
        ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Aucun conseiller trouvé</h3>
                  <p className="text-gray-600 mb-8">
                    Essayez de modifier vos filtres ou contactez-nous pour plus d'informations
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <a href="/contact">Nous contacter</a>
            </Button>
                    <Button onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialties([]);
                    }}>
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Besoin d'aide pour choisir un conseiller ?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Notre équipe peut vous aider à trouver le conseiller idéal pour vos besoins spécifiques. 
                Contactez-nous pour un accompagnement personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Calendar className="mr-2 h-5 w-5" />
            Demander une orientation
          </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Phone className="mr-2 h-5 w-5" />
                  Nous appeler
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section informations de contact */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-6">Informations de Contact</h2>
              <p className="text-lg text-gray-600">
                Notre équipe est disponible pour répondre à toutes vos questions
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600">contact@orientationprocongo.com</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Téléphone</h3>
                <p className="text-gray-600">+242 00 000 000</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Adresse</h3>
                <p className="text-gray-600">Brazzaville, République du Congo</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
