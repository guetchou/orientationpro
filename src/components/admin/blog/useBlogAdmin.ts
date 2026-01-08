
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { BlogPost } from '@/types/blog'; // Import the unified BlogPost type

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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Charger les articles
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Convert status to the expected type
        const typedPosts = (data || []).map(post => ({
          ...post,
          status: post.status === 'published' ? 'published' : 'draft' as 'draft' | 'published',
          slug: post.slug || '',
          featured_image: post.featured_image || post.image_url || '',
          category: post.category || 'uncategorized',
          updated_at: post.updated_at || post.created_at || ''
        }));
        
        setPosts(typedPosts);
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
      const normalizedPost = {
        ...post,
        status: post.status === 'published' ? 'published' : 'draft' as 'draft' | 'published'
      };
      
      if (editingPost) {
        // Mise à jour d'un article existant
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: normalizedPost.title,
            content: normalizedPost.content,
            excerpt: normalizedPost.excerpt,
            image_url: normalizedPost.image_url,
            featured_image: normalizedPost.featured_image,
            slug: normalizedPost.slug,
            category: normalizedPost.category,
            tags: normalizedPost.tags,
            status: normalizedPost.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...normalizedPost } : p));
        toast.success('Article mis à jour avec succès');
      } else {
        // Création d'un nouvel article
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            ...normalizedPost,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (error) throw error;
        
        setPosts(prev => [...prev, {...data[0], status: data[0].status as 'draft' | 'published'}]);
        toast.success('Article créé avec succès');
      }

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
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Article supprimé avec succès');
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
