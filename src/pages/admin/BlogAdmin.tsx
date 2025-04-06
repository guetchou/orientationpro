
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BlogPostTable } from '@/components/admin/blog/BlogPostTable';
import { BlogPostEditor } from '@/components/admin/blog/BlogPostEditor';
import { supabase } from '@/integrations/supabase/client';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'news',
    status: 'draft',
    featured_image: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Replace with your actual data fetching logic
      const mockPosts = [
        {
          id: '1',
          title: 'Guide complet pour choisir son orientation',
          slug: 'guide-orientation',
          status: 'published',
          category: 'guides',
          excerpt: 'Découvrez comment faire les bons choix pour votre avenir professionnel',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T14:20:00Z',
        },
        {
          id: '2',
          title: 'Les métiers d\'avenir dans la tech',
          slug: 'metiers-avenir-tech',
          status: 'published',
          category: 'career',
          excerpt: 'Quels sont les métiers qui recruteront le plus dans les 10 prochaines années',
          created_at: '2024-02-01T09:15:00Z',
          updated_at: '2024-02-01T09:15:00Z',
        },
        {
          id: '3',
          title: 'Préparer son entretien d\'embauche',
          slug: 'preparer-entretien',
          status: 'draft',
          category: 'tips',
          excerpt: 'Les conseils essentiels pour réussir vos entretiens d\'embauche',
          created_at: '2024-03-10T16:20:00Z',
          updated_at: '2024-03-10T16:20:00Z',
        },
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'news',
      status: 'draft',
      featured_image: '',
    });
    setIsEditing(false);
    setShowDialog(true);
  };

  const handleEditPost = (post: any) => {
    setFormData({
      ...post,
      content: post.content || '',
      featured_image: post.featured_image || '',
    });
    setSelectedPost(post);
    setIsEditing(true);
    setShowDialog(true);
  };

  const handleSubmit = async (data: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        // Update existing post
        toast.success('Article mis à jour avec succès');
      } else {
        // Create new post
        toast.success('Article créé avec succès');
      }
      setShowDialog(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'article');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion du Blog</h1>
          <Button onClick={handleCreatePost}>Nouvel article</Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous les articles</TabsTrigger>
            <TabsTrigger value="published">Publiés</TabsTrigger>
            <TabsTrigger value="drafts">Brouillons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <BlogPostTable
              posts={posts}
              loading={loading}
              onEdit={handleEditPost}
              onDelete={(id) => console.log('Delete post', id)}
            />
          </TabsContent>
          
          <TabsContent value="published" className="mt-6">
            <BlogPostTable
              posts={posts.filter(post => post.status === 'published')}
              loading={loading}
              onEdit={handleEditPost}
              onDelete={(id) => console.log('Delete post', id)}
            />
          </TabsContent>
          
          <TabsContent value="drafts" className="mt-6">
            <BlogPostTable
              posts={posts.filter(post => post.status === 'draft')}
              loading={loading}
              onEdit={handleEditPost}
              onDelete={(id) => console.log('Delete post', id)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
            </DialogTitle>
          </DialogHeader>
          <BlogPostEditor
            initialData={formData}
            isEditing={isEditing}
            onSubmit={(data) => handleSubmit(data, isEditing)}
            onCancel={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
