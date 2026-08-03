
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BlogPost } from '@/types/blog'; // Import the unified BlogPost type

// Aucun backend de gestion du blog n'existe encore (voir issue de retrait de
// Supabase) : toutes les opérations échouent volontairement plutôt que de
// simuler un succès qui ne persisterait rien.
const blogBackendUnavailable = () => Promise.reject(new Error());

// We'll remove the local BlogPost interface definition and use the imported one

export const emptyPost: BlogPost = {
  id: '',
  title: '',
  content: '',
  excerpt: '',
  image_url: '',
  featured_image: '', // Added from the imported type
  slug: '', // Added from the imported type
  category: 'uncategorized', // Added from the imported type
  tags: [],
  status: 'draft',
  created_at: '',
  updated_at: '', // Added from the imported type
};

export function useBlogAdmin() {
  const [posts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Charger les articles
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        await blogBackendUnavailable();
      } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        setError(error.message);
        toast.error('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Gérer la soumission du formulaire (création ou mise à jour)
  const handleSubmit = async (post: BlogPost) => {
    try {
      await blogBackendUnavailable();
      handleCancel();
    } catch (error: any) {
      console.error('Error submitting blog post:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement de l\'article');
    }
  };

  // Annuler l'édition/création
  const handleCancel = () => {
    setEditingPost(null);
    setIsCreating(false);
  };

  // Supprimer un article
  const deletePost = async (id: string) => {
    try {
      await blogBackendUnavailable();
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      toast.error(error.message || 'Erreur lors de la suppression de l\'article');
    }
  };

  return {
    posts,
    loading,
    error,
    editingPost,
    isCreating,
    setEditingPost,
    setIsCreating,
    handleSubmit,
    handleCancel,
    deletePost
  };
}
