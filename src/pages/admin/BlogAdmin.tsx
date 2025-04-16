
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BlogPostsTable from '@/components/admin/blog/BlogPostsTable';
import BlogPostEditor from '@/components/admin/blog/BlogPostEditor';
import { useBlogAdmin, emptyPost } from '@/components/admin/blog/useBlogAdmin';
import { BlogPost } from '@/types/blog';

export default function BlogAdmin() {
  const {
    posts,
    loading,
    editingPost,
    isCreating,
    setEditingPost,
    setIsCreating,
    handleSubmit,
    handleCancel,
    deletePost
  } = useBlogAdmin();

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
          onSubmit={async (data: BlogPost) => await handleSubmit(data)}
          onCancel={handleCancel}
        />
      ) : (
        <BlogPostsTable
          posts={posts}
          loading={loading}
          onEdit={(post: BlogPost) => setEditingPost(post)}
          onDelete={(id: string) => deletePost(id)}
        />
      )}
    </div>
  );
}
