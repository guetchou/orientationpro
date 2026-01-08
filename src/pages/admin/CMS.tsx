
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentList } from "@/components/admin/cms/ContentList";
import { ContentEditor } from "@/components/admin/cms/ContentEditor";
import { ContentSearch } from "@/components/admin/cms/ContentSearch";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  category?: string;
}

const CMS = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("articles");
  
  // Formulaire d'édition
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "articles",
    image_url: "",
    category: "Général"
  });

  useEffect(() => {
    fetchContents();
  }, [currentTab]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cms_contents')
        .select('*')
        .eq('type', currentTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setContents(data as ContentItem[] || []);
    } catch (error) {
      console.error("Erreur lors du chargement des contenus:", error);
      toast.error("Erreur lors du chargement des contenus");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      type: item.type,
      image_url: item.image_url || "",
      category: item.category || "Général"
    });
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      try {
        const { error } = await supabase
          .from('cms_contents')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setContents(contents.filter(item => item.id !== id));
        toast.success("Contenu supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression du contenu");
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editMode && currentItem) {
        // Mode édition
        const { error } = await supabase
          .from('cms_contents')
          .update({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            image_url: formData.image_url,
            category: formData.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentItem.id);

        if (error) throw error;
        toast.success("Contenu mis à jour avec succès");
      } else {
        // Nouveau contenu
        const { error } = await supabase
          .from('cms_contents')
          .insert({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            type: currentTab,
            image_url: formData.image_url,
            category: formData.category
          });

        if (error) throw error;
        toast.success("Contenu créé avec succès");
      }

      // Réinitialiser le formulaire et rafraîchir la liste
      resetForm();
      fetchContents();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement du contenu");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      type: currentTab,
      image_url: "",
      category: "Général"
    });
    setEditMode(false);
    setCurrentItem(null);
  };

  const filteredContents = contents.filter(
    item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestion de Contenu</h1>
      
      <Tabs defaultValue="articles" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="actualites">Actualités</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <ContentSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          onNewClick={() => setEditMode(false)} 
        />

        <div className="grid grid-cols-3 gap-6">
          <ContentList 
            contents={filteredContents} 
            loading={loading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
          
          <ContentEditor 
            editMode={editMode} 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleFormSubmit} 
            onCancel={resetForm} 
          />
        </div>
      </Tabs>
    </div>
  );
};

export default CMS;
