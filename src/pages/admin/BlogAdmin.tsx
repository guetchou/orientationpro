
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BlogPostTable } from "@/components/admin/blog/BlogPostTable";
import { BlogPostEditor } from "@/components/admin/blog/BlogPostEditor";
import { WordPressPost, WordPressCategory } from "@/types/wordpress";
import { wordpressService } from "@/services/wordpressService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function BlogAdmin() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [selectedPost, setSelectedPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [currentPage, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await wordpressService.getPosts(currentPage, 10, searchTerm);
      setPosts(data);
      
      // Get total pages
      if ((data as any).totalPages) {
        setTotalPages((data as any).totalPages);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      toast.error("Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await wordpressService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const handleEdit = (post: WordPressPost) => {
    setSelectedPost(post);
    setIsNew(false);
  };

  const handleNew = () => {
    setSelectedPost(null);
    setIsNew(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        const success = await wordpressService.deletePost(id, token);
        if (success) {
          toast.success("Article supprimé avec succès");
          fetchPosts();
          setSelectedPost(null);
        } else {
          toast.error("Erreur lors de la suppression de l'article");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de l'article");
      }
    }
  };

  const handleSave = async (postData: Partial<WordPressPost>) => {
    if (!token) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    try {
      let savedPost: WordPressPost | null = null;

      if (selectedPost && !isNew) {
        // Update existing post
        savedPost = await wordpressService.updatePost(selectedPost.id, postData, token);
        if (savedPost) {
          toast.success("Article mis à jour avec succès");
        }
      } else {
        // Create new post
        savedPost = await wordpressService.createPost(postData, token);
        if (savedPost) {
          toast.success("Article créé avec succès");
        }
      }

      if (savedPost) {
        fetchPosts();
        setSelectedPost(null);
        setIsNew(false);
      } else {
        toast.error("Erreur lors de l'enregistrement de l'article");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement de l'article");
    }
  };

  const handleCancel = () => {
    setSelectedPost(null);
    setIsNew(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des Articles de Blog</h1>
        
        <Tabs defaultValue="liste" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="liste">Liste des Articles</TabsTrigger>
            <TabsTrigger value="editeur" disabled={!selectedPost && !isNew}>
              {isNew ? "Nouvel Article" : "Modifier l'Article"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="liste">
            <Card>
              <CardHeader>
                <CardTitle>Articles de Blog</CardTitle>
                <CardDescription>
                  Gérez les articles publiés sur votre blog WordPress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostTable 
                  posts={posts} 
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onNew={handleNew}
                  onSearch={handleSearch}
                  searchTerm={searchTerm}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="editeur">
            <Card>
              <CardHeader>
                <CardTitle>{isNew ? "Créer un nouvel article" : "Modifier l'article"}</CardTitle>
                <CardDescription>
                  {isNew 
                    ? "Remplissez les champs pour créer un nouvel article" 
                    : "Modifiez les détails de l'article sélectionné"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostEditor 
                  post={selectedPost} 
                  isNew={isNew}
                  categories={categories}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
