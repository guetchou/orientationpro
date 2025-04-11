
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  author_id?: string;
  published_at?: string;
  tags?: string[];
  status: 'draft' | 'published';
  created_at?: string;
}

export const emptyPost: BlogPost = {
  title: '',
  content: '',
  excerpt: '',
  image_url: '',
  tags: [],
  status: 'draft'
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
        setPosts(data || []);
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
      if (editingPost) {
        // Mise à jour d'un article existant
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            image_url: post.image_url,
            tags: post.tags,
            status: post.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...post } : p));
        toast.success('Article mis à jour avec succès');
      } else {
        // Création d'un nouvel article
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            ...post,
            created_at: new Date().toISOString()
          })
          .select();

        if (error) throw error;
        
        setPosts(prev => [...prev, data[0]]);
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
