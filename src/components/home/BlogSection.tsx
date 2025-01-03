import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BlogSection = () => {
  const articles = [
    {
      title: "Comment choisir sa filière universitaire ?",
      excerpt: "Guide complet pour faire le bon choix d'études supérieures...",
      date: "10 Avril 2024",
      category: "Orientation"
    },
    {
      title: "Les métiers d'avenir au Congo",
      excerpt: "Découvrez les secteurs qui recrutent et les compétences recherchées...",
      date: "8 Avril 2024",
      category: "Carrière"
    },
    {
      title: "Réussir son entretien d'embauche",
      excerpt: "Conseils pratiques pour se démarquer lors d'un entretien...",
      date: "5 Avril 2024",
      category: "Conseils"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-heading text-3xl font-bold">
            Notre Blog
          </h2>
          <Button variant="outline">
            Tous les articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.title} className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-primary font-medium">{article.category}</span>
                  <span className="text-sm text-gray-500">{article.date}</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <Button variant="link" className="p-0">
                  Lire la suite
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};