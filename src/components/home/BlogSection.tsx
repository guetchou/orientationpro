
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { wordpressService } from "@/services/wordpressService";
import { WordPressPost } from "@/types/wordpress";
import { BlogPost } from "@/components/blog/BlogPost";
import { BlogSkeleton } from "@/components/blog/BlogSkeleton";

export const BlogSection = () => {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      setLoading(true);
      const data = await wordpressService.getPosts(1, 3); // Fetch 3 most recent posts
      setPosts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des articles récents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-4">
              Articles Récents
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Découvrez nos derniers articles sur l'orientation, la carrière et le développement professionnel.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex" asChild>
            <Link to="/blog">
              Tous les articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <BlogSkeleton count={3} />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPost key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">
              Tous les articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
