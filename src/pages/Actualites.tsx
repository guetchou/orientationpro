
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChatBot } from "@/components/chat/ChatBot";
import { ActualitesList } from "@/components/actualites/ActualitesList";
import { ActualitesHeader } from "@/components/actualites/ActualitesHeader";
import { ActualitesFeatured } from "@/components/actualites/ActualitesFeatured";
import { ActualitesCategories } from "@/components/actualites/ActualitesCategories";
import { ActualitesStats } from "@/components/actualites/ActualitesStats";
import { toast } from "sonner";

export interface Actualite {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  category: string;
  created_at: string;
}

export default function Actualites() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredActualite, setFeaturedActualite] = useState<Actualite | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActualites();
  }, []);

  const fetchActualites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cms_contents')
        .select('*')
        .eq('type', 'actualites')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Conversion des données
      const actualitesData = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content,
        image_url: item.image_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        category: item.category || 'Général',
        created_at: item.created_at
      })) as Actualite[] || [];
      
      setActualites(actualitesData);
      
      // Sélectionner l'actualité la plus récente comme mise en avant
      if (actualitesData.length > 0) {
        setFeaturedActualite(actualitesData[0]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
      toast.error("Erreur lors du chargement des actualités");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Filtrer par catégorie et terme de recherche
  const filteredActualites = actualites
    .filter(item => !selectedCategory || item.category === selectedCategory)
    .filter(item => 
      searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Exclure l'actualité mise en avant de la liste principale
  const regularActualites = featuredActualite 
    ? filteredActualites.filter(item => item.id !== featuredActualite.id) 
    : filteredActualites;

  // Extraire les catégories uniques
  const categories = [...new Set(actualites.map(item => item.category))];
  
  // Compter les actualités par catégorie
  const categoriesCount = actualites.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <ActualitesHeader onSearch={handleSearch} />
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Chargement...</span>
            </div>
            <p className="mt-4 text-muted-foreground">Chargement des actualités...</p>
          </div>
        ) : (
          <>
            {featuredActualite && <ActualitesFeatured actualite={featuredActualite} />}
            
            <ActualitesStats 
              categoriesCount={categoriesCount} 
              totalArticles={actualites.length} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
              <div className="md:col-span-1">
                <ActualitesCategories 
                  categories={categories} 
                  selectedCategory={selectedCategory}
                  onSelectCategory={filterByCategory}
                />
              </div>
              
              <div className="md:col-span-3">
                <ActualitesList actualites={regularActualites} />
              </div>
            </div>
          </>
        )}
      </main>

      <ChatBot />
    </div>
  );
}
