
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { wordpressService } from "@/services/wordpressService";
import { WordPressPost } from "@/types/wordpress";
import { ArrowLeft, Calendar, Share2, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChatBot } from "@/components/chat/ChatBot";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const data = await wordpressService.getPostBySlug(postSlug);
      setPost(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'article:", error);
      toast.error("Impossible de charger l'article");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: fr });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title.rendered || "Article de blog",
        url: window.location.href,
      }).catch((error) => {
        console.error("Erreur lors du partage:", error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  // Get categories from _embedded if available
  const getCategories = () => {
    if (post?._embedded && post._embedded["wp:term"]) {
      return post._embedded["wp:term"][0] || [];
    }
    return [];
  };

  // Get author if available
  const getAuthor = () => {
    if (post?._embedded && post._embedded["author"] && post._embedded["author"][0]) {
      return post._embedded["author"][0].name;
    }
    return "Auteur inconnu";
  };

  // Get featured image if available
  const getFeaturedImage = () => {
    if (post?._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]) {
      return post._embedded["wp:featuredmedia"][0].source_url;
    }
    return "/placeholder.svg";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux articles
            </Link>
          </Button>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : post ? (
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 md:h-96">
                <img 
                  src={getFeaturedImage()} 
                  alt={post.title.rendered}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getCategories().map((category: any) => (
                        <Badge key={category.id} className="bg-primary/80 hover:bg-primary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <h1 
                      className="text-2xl md:text-4xl font-bold" 
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>{getAuthor()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
                
                <div 
                  className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />
              </div>
            </article>
          ) : (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Article non trouvé</h3>
              <p className="text-muted-foreground mb-4">
                L'article que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button asChild>
                <Link to="/blog">
                  Voir tous les articles
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <ChatBot />
      <Footer />
    </div>
  );
}
