import { useState, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/chat/ChatBot";
import { localBlogService } from "@/services/localBlogService";
import { WordPressPost } from "@/types/wordpress";
import { toast } from "sonner";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogPost } from "@/components/blog/BlogPost";
import { BlogSkeleton } from "@/components/blog/BlogSkeleton";
import { BlogEmpty } from "@/components/blog/BlogEmpty";

export default function Blog() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      // Reset to first page when searching
      setCurrentPage(1);
      fetchBlogPosts();
    }
  }, [searchTerm]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const data = await localBlogService.getPosts(currentPage, postsPerPage, searchTerm);
      
      // Get total pages from the local service
      const totalPosts = await localBlogService.getTotalPosts(searchTerm);
      const calculatedTotalPages = Math.ceil(totalPosts / postsPerPage);
      setTotalPages(calculatedTotalPages);
      
      setPosts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      toast.error("Impossible de charger les articles de blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogPosts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <BlogHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onSearchSubmit={handleSearchSubmit} 
        />

        {loading ? (
          <BlogSkeleton count={postsPerPage} />
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPost key={post.id} post={post} />
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border bg-white/80 disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded border bg-white/80 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        ) : (
          <BlogEmpty searchTerm={searchTerm} onReset={() => setSearchTerm("")} />
        )}
      </main>

      <ChatBot />
      <Footer />
    </div>
  );
}
