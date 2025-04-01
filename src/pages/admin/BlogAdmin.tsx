
import React, { useState, useEffect } from 'react';
import { wordpressService } from '@/services/wordpressService';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WordPressPost } from '@/types/wordpress';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BlogPostEditor } from '@/components/admin/blog/BlogPostEditor';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const BlogAdmin = () => {
  const { profileData } = useAuth();
  const isSuperAdmin = profileData?.role === 'super_admin';
  
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<WordPressPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await wordpressService.getPosts(1, 100, '');
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentPost(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (post: WordPressPost) => {
    setCurrentPost(post);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteId(id);
      await wordpressService.deletePost(id);
      toast.success('Article supprimé avec succès');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression de l\'article');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSave = async (post: Partial<WordPressPost>) => {
    try {
      if (post.id) {
        // Update existing post
        await wordpressService.updatePost(post.id, post);
        toast.success('Article mis à jour avec succès');
      } else {
        // Create new post
        await wordpressService.createPost(post);
        toast.success('Article créé avec succès');
      }
      setIsEditorOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erreur lors de la sauvegarde de l\'article');
    }
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Gestion du Blog</h1>
          <p className="text-red-500">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion du Blog</h1>
          <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Aucun article trouvé
                    </td>
                  </tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title.rendered}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {post.status || 'Publié'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(post.id)}
                          disabled={isDeleting && deleteId === post.id}
                        >
                          {isDeleting && deleteId === post.id ? 
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div> : 
                            <Trash2 className="h-4 w-4" />
                          }
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentPost ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
          </DialogHeader>
          <BlogPostEditor 
            post={currentPost} 
            onSave={handleSave}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BlogAdmin;
