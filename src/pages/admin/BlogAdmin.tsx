
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import BlogPostsTable from '@/components/admin/blog/BlogPostsTable';
import BlogPostEditor from '@/components/admin/blog/BlogPostEditor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }

  async function createPost(newPost: Partial<BlogPost>) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([
          {
            ...newPost,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      toast.success('Article créé avec succès');
      setPosts([data[0], ...posts]);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erreur lors de la création de l\'article');
    }
  }

  async function updatePost(updatedPost: BlogPost) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          ...updatedPost,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPost.id);

      if (error) throw error;
      toast.success('Article mis à jour avec succès');
      setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
    }
  }

  async function deletePost(id: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Article supprimé avec succès');
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression de l\'article');
    }
  }

  async function handleSubmit(post: BlogPost) {
    if (editingPost) {
      await updatePost(post);
    } else {
      await createPost(post);
    }
  }

  function handleCancel() {
    setEditingPost(null);
    setIsCreating(false);
  }

  const emptyPost: BlogPost = {
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    featured_image: '',
    category: 'uncategorized',
    created_at: '',
    updated_at: ''
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion du Blog</h1>
      
      {!editingPost && !isCreating && (
        <div className="mb-4">
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Nouvel Article
          </Button>
        </div>
      )}
      
      {(editingPost || isCreating) ? (
        <BlogPostEditor
          post={editingPost || emptyPost}
          isEditing={!!editingPost}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <BlogPostsTable
          posts={posts}
          loading={loading}
          onEdit={(post) => setEditingPost(post)}
          onDelete={(id) => deletePost(id)}
        />
      )}
    </div>
  );
}
