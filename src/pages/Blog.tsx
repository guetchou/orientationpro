
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock, Search, Tag, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ChatBot } from "@/components/chat/ChatBot";
import { wordpressService } from "@/services/wordpressService";
import { WordPressPost } from "@/types/wordpress";
import { toast } from "sonner";
import { Pagination } from "@/components/blog/Pagination";
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
      const data = await wordpressService.getPosts(currentPage, postsPerPage, searchTerm);
      
      // Get total pages from headers - this assumes the WordPress API returns X-WP-TotalPages header
      // You might need to adjust this based on your WordPress setup
      const totalPagesFromHeader = parseInt(data.headers?.['x-wp-totalpages'] || '1');
      setTotalPages(totalPagesFromHeader);
      
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
      
      <Navbar />
      
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
            
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
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
