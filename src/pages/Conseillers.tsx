
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CounselorCard } from "@/components/counselors/CounselorCard"; 
import { CounselorFilter } from "@/components/counselors/CounselorFilter";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function Conseillers() {
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: "all",
    availability: "all",
  });

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

  // Filter counselors based on selected filters
  const filteredCounselors = counselors.filter(counselor => {
    // Apply specialty filter if not "all"
    if (filters.specialty !== "all" && counselor.department !== filters.specialty) {
      return false;
    }
    // More filters could be added here
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            Nos Conseillers d'Orientation
          </h1>
          <p className="text-lg text-gray-600">
            Prenez rendez-vous avec un de nos conseillers experts pour un accompagnement personnalisé dans votre parcours d'orientation
          </p>
        </motion.div>

        <div className="mb-8">
          <CounselorFilter 
            onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})} 
            currentFilters={filters}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredCounselors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCounselors.map((counselor) => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun conseiller trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou contactez-nous pour plus d'informations</p>
            <Button asChild variant="outline">
              <a href="/contact">Nous contacter</a>
            </Button>
          </div>
        )}

        <div className="mt-12 bg-primary/5 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'aide pour choisir un conseiller?</h2>
          <p className="text-lg mb-6">Notre équipe peut vous aider à trouver le conseiller idéal pour vos besoins spécifiques</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Calendar className="mr-2 h-4 w-4" />
            Demander une orientation
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
