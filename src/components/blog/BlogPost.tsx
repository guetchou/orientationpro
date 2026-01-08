
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock, Tag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WordPressPost } from "@/types/wordpress";

interface BlogPostProps {
  post: WordPressPost;
}

export const BlogPost = ({ post }: BlogPostProps) => {
  // Format the date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Extract categories from _embedded if available
  const getCategories = () => {
    try {
      if (post._embedded && post._embedded["wp:term"]) {
        return post._embedded["wp:term"][0] || [];
      }
    } catch (error) {
      console.error("Error getting categories:", error);
    }
    return [];
  };

  // Get featured image if available
  const getFeaturedImage = () => {
    try {
      if (post._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]) {
        return post._embedded["wp:featuredmedia"][0].source_url;
      }
    } catch (error) {
      console.error("Error getting featured image:", error);
    }
    return "/placeholder.svg";
  };

  // Get author if available
  const getAuthor = () => {
    try {
      if (post._embedded && post._embedded["author"] && post._embedded["author"][0]) {
        return post._embedded["author"][0].name;
      }
    } catch (error) {
      console.error("Error getting author:", error);
    }
    return "Auteur inconnu";
  };

  // Clean HTML from excerpt
  const cleanExcerpt = (html: string) => {
    try {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    } catch (error) {
      console.error("Error cleaning excerpt:", error);
      return "";
    }
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={getFeaturedImage()}
          alt={post.title?.rendered || "Article"}
          className="w-full h-full object-cover"
        />
        {getCategories().length > 0 && (
          <Badge className="absolute top-4 left-4 bg-white/90 text-primary hover:bg-white">
            {getCategories()[0].name}
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(post.date)}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            5 min
          </div>
        </div>
        <CardTitle 
          className="line-clamp-2 text-xl" 
          dangerouslySetInnerHTML={{ __html: post.title?.rendered || "Sans titre" }}
        />
        <CardDescription className="line-clamp-2">
          {post.excerpt?.rendered ? cleanExcerpt(post.excerpt.rendered) : "Pas de résumé disponible"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center text-sm text-gray-500">
          <User className="w-4 h-4 mr-2" />
          <span>{getAuthor()}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/blog/${post.slug}`}>
            Lire l'article
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
